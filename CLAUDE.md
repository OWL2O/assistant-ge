# ASSISTANT.ge — Claude Code Context

## Stack
- **Framework:** Next.js 15.1 (App Router), React 19, TypeScript strict
- **Auth + DB:** Supabase (SSR cookies via `@supabase/ssr`)
- **Hosting:** Vercel
- **Excel:** SheetJS (`xlsx`)
- **Currency rates:** NBG API

## Folder structure
```
app/
  layout.tsx                     root layout (imports globals.css)
  page.tsx                       redirect → /dashboard
  globals.css                    full dark theme + all CSS classes
  auth/
    layout.tsx                   centered card wrapper
    login/page.tsx               email+password sign-in
    register/page.tsx            sign-up + email confirm
    callback/route.ts            Supabase OAuth callback
  dashboard/
    layout.tsx                   auth guard + DashboardHeader (createAdminClient for profile)
    (pages)/
      layout.tsx                 maxWidth:1200px container
      page.tsx                   org grid + request section
    importer/
      page.tsx                   TBC importer (full-width, no container)
  admin/
    layout.tsx                   admin guard (createAdminClient for is_admin check)
    page.tsx                     stats + AdminUsersTable
  api/
    organizations/create/        POST: credit check → create paid org (365 days)
    org-requests/create/         POST: send org request (duplicate-pending check)
    admin/approve-request/       POST: approve/reject pending request + grant credit
    admin/grant-credit/          POST: manually add credits
    admin/rename-org/            POST: rename any org
components/
  DashboardHeader.tsx            sticky header, logout, admin link
  OrgCard.tsx                    org card with countdown bar → links to /dashboard/importer?org=ID
  RequestOrgButton.tsx           POSTs to /api/org-requests/create
  CreateOrgForm.tsx              POSTs to /api/organizations/create
  admin/AdminUsersTable.tsx      full admin UI: approve/reject requests, grant credits, rename orgs
  importer/TbcImporter.tsx       full TBC→FINS importer with NBG rates
lib/
  supabase/client.ts             browser Supabase client
  supabase/server.ts             server component client (cookie-based)
  supabase/admin.ts              service role client (RLS bypass) — use for all DB ops
  types.ts                       Profile, Organization, Credit, OrgRequest
middleware.ts                    route protection + admin guard
```

## Supabase schema
```sql
profiles        -- id, email, full_name, phone, is_admin (trigger: auto-created on signup)
organizations   -- id, user_id, name, is_demo, is_active, activated_at, expires_at, created_at
credits         -- id, user_id, granted_by, amount, note, created_at
org_requests    -- id, user_id, status(pending|approved|rejected), message, created_at
```

Trigger: new user → `profiles` row + Demo `organizations` row created automatically.
Admin: `is_admin = true` for `Astonmartin2009@gmail.com`.
RLS is enabled — **always use `createAdminClient()` for server-side DB queries** (not the user session client).

## .env.local
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Business logic
- **Demo org:** free, 10-row limit, no export, permanent
- **Paid org:** 100₾, unlimited rows, export enabled, 365-day expiry
- **Renewal:** 20₾, re-activates for another 365 days
- Flow: user registers → Demo org auto-created → user sends org request → admin approves → credit +1 → user creates paid org → org expires after 365 days

## API pattern (all admin-only routes)
```typescript
// Auth check with user client
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// All DB operations with admin client (bypass RLS)
const admin = createAdminClient()
```

## CSS classes (all defined in globals.css)
`.btn` `.btn-primary` `.btn-ghost` `.btn-success` `.btn-danger` `.btn-sm` `.btn-lg`
`.input` `.input.error`
`.card` `.card-glow`
`.badge` `.badge-active` `.badge-demo` `.badge-expired` `.badge-pending`
`.toast` `.toast.success` `.toast.error`
`.spinner`
`.table-wrap` + `table thead th` + `tbody td` + `tbody td.primary`

## Dark theme CSS variables
```css
--bg:       #0f0f12   /* page background */
--surface:  #16161c   /* card background */
--surface2: #1e1e27   /* input / table header background */
--border:   #2a2a38   /* subtle borders */
--border2:  #353548   /* input borders */
--accent:   #6c8eff   /* blue — primary actions, links */
--accent2:  #4ade80   /* green — success, active */
--warn:     #fbbf24   /* yellow — demo, pending */
--danger:   #f87171   /* red — expired, error */
--text:     #e8e8f0   /* primary text */
--text2:    #8888aa   /* secondary text */
--text3:    #55556a   /* muted text */
```

## Route group explanation
`app/dashboard/(pages)/` is a Next.js route group — the `(pages)` folder has no URL effect.
- `/dashboard` → `(pages)/page.tsx` (wrapped in `(pages)/layout.tsx` for container)
- `/dashboard/importer` → `importer/page.tsx` (no container — full-width table UI)

## NBG rate API
```
GET https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/?currencies=USD&date=2024-01-15
Response: [{ currencies: [{ rate: 2.7134 }] }]
```

## TBC Excel structure
- Sheet index 1 (skip "Summary")
- Rows 0-1: headers, data starts row 2
- Columns: `[0]=date [1]=description [3]=paidOut [4]=paidIn [6]=txType [8]=ref [9]=partnerAcc [10]=partner [11]=partnerTax [22]=txId`

## FINS export headers
```
['თარიღი*','დოკუმენტი','ანგ. დებეტი*','დასახელება','ანგ. კრედიტი*','დასახელება',
 'თანხა*','ვალუტა*','კურსი*','რაოდენობა','ერთეული','ერთეულის ფასი',
 'დანიშნულება','ობიექტი*','ზემოქმედი','კავშირი','შექმინს თარიღი']
```

## Known issues / completed
- ✅ Auth (login, register, callback)
- ✅ Supabase schema + triggers
- ✅ Admin profile set (`Astonmartin2009@gmail.com`)
- ✅ Dashboard org grid + countdown
- ✅ TbcImporter (full TBC→FINS converter)
- ✅ Admin panel (approve/reject requests, grant credits, rename orgs)
- ✅ All API routes use `createAdminClient()` for DB ops
- ✅ ESLint configured (`eslint.config.mjs`)
- ✅ Zero TypeScript errors, zero ESLint warnings
- ⏳ Vercel deploy (set env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SERVICE_ROLE_KEY)
- ⏳ Duplicate Demo org cleanup (run in Supabase SQL editor — see below)

## Duplicate org cleanup SQL
If a user has duplicate Demo orgs, run in Supabase SQL editor:
```sql
-- Keep newest, delete older duplicates
DELETE FROM organizations
WHERE is_demo = true
  AND id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM organizations
    WHERE is_demo = true
    ORDER BY user_id, created_at DESC
  );
```

For a specific user:
```sql
DELETE FROM organizations
WHERE name = 'Demo Org'
  AND user_id = '36b0f097-b0c7-42a1-b3c5-0e8a25146de2'
  AND id NOT IN (
    SELECT id FROM organizations
    WHERE user_id = '36b0f097-b0c7-42a1-b3c5-0e8a25146de2'
      AND is_demo = true
    ORDER BY created_at DESC
    LIMIT 1
  );
```
