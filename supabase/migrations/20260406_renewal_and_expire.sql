-- Renewal + expiration helpers.
--
-- `expires_at` already exists on public.organizations. These functions
-- wrap the renewal and expiry sweeps in atomic blocks.

-- ── Renewal ─────────────────────────────────────────────────────────
-- Atomically: deduct a "renewal credit" (amount = -1, note='renewal'),
-- extend expires_at by 365 days, and re-activate the org.
-- Fails fast if no spare credit is available or if the org is a Demo.

create or replace function public.renew_organization(
  p_org_id  uuid,
  p_user_id uuid
)
returns table (new_expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_demo   boolean;
  v_owner     uuid;
  v_credits   int;
  v_paid_orgs int;
  v_new       timestamptz;
begin
  select is_demo, user_id
    into v_is_demo, v_owner
    from public.organizations
   where id = p_org_id
   for update;

  if not found then
    raise exception 'org_not_found' using errcode = 'P0002';
  end if;
  if v_owner <> p_user_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_is_demo then
    raise exception 'demo_cannot_renew' using errcode = '22023';
  end if;

  -- Credits available = sum(credits.amount) − count(paid orgs).
  -- Renewal uses a fresh credit, same as initial creation.
  select coalesce(sum(amount), 0)
    into v_credits
    from public.credits
   where user_id = p_user_id;

  select count(*)
    into v_paid_orgs
    from public.organizations
   where user_id = p_user_id and is_demo = false;

  if v_credits - v_paid_orgs < 1 then
    raise exception 'no_credits' using errcode = '53400';
  end if;

  v_new := now() + interval '365 days';

  update public.organizations
     set is_active    = true,
         activated_at = now(),
         expires_at   = v_new
   where id = p_org_id;

  insert into public.credits (user_id, granted_by, amount, note)
  values (p_user_id, p_user_id, -1, 'renewal');

  return query select v_new;
end;
$$;

revoke all on function public.renew_organization(uuid, uuid) from public;
grant execute on function public.renew_organization(uuid, uuid) to service_role;

-- ── Expiry sweep ────────────────────────────────────────────────────
-- Called by the /api/cron/expire-orgs Vercel cron. Flips is_active=false
-- on every paid org whose expires_at is in the past.

create or replace function public.expire_overdue_orgs()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.organizations
     set is_active = false
   where is_demo   = false
     and is_active = true
     and expires_at is not null
     and expires_at < now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.expire_overdue_orgs() from public;
grant execute on function public.expire_overdue_orgs() to service_role;

-- Helpful index for the cron sweep.
create index if not exists organizations_expires_at_active_idx
  on public.organizations (expires_at)
  where is_active = true and is_demo = false;
