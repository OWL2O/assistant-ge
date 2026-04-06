-- Atomic approve/reject for org_requests.
-- PL/pgSQL functions run in an implicit transaction: if any statement
-- raises, Postgres rolls back every change made inside the function.
--
-- Called from the Node admin route via supabase.rpc('approve_org_request', ...).
-- Returns the target user_id so the route can look up the recipient email
-- without a second round-trip.

create or replace function public.approve_org_request(
  p_request_id uuid,
  p_admin_id   uuid,
  p_action     text  -- 'approve' | 'reject'
)
returns table (user_id uuid, new_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_status  text;
  v_new     text;
begin
  if p_action not in ('approve', 'reject') then
    raise exception 'invalid_action' using errcode = '22023';
  end if;

  -- Lock the row so two admins can't double-approve the same request.
  select r.user_id, r.status
    into v_user_id, v_status
    from public.org_requests r
   where r.id = p_request_id
   for update;

  if not found then
    raise exception 'request_not_found' using errcode = 'P0002';
  end if;

  if v_status <> 'pending' then
    raise exception 'already_processed' using errcode = '55000';
  end if;

  v_new := case when p_action = 'approve' then 'approved' else 'rejected' end;

  update public.org_requests
     set status = v_new
   where id = p_request_id;

  if p_action = 'approve' then
    insert into public.credits (user_id, granted_by, amount, note)
    values (v_user_id, p_admin_id, 1, 'org request approved');
  end if;

  return query select v_user_id, v_new;
end;
$$;

-- Only the service role should invoke this from the server.
revoke all on function public.approve_org_request(uuid, uuid, text) from public;
grant execute on function public.approve_org_request(uuid, uuid, text) to service_role;
