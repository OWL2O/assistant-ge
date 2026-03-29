# ASSISTANT.ge — Claude Code Context

## პროექტის მიზანი
SaaS პლატფორმა ბუღალტრებისთვის. TBC ბანკის Excel ამონაწერი (.xlsx) → FINS საბუღალტრო სისტემის ფორმატი.

## ტექნიკური სტეკი
- **Framework:** Next.js 15 (App Router)
- **Auth + DB:** Supabase
- **Hosting:** Vercel
- **Excel:** SheetJS (xlsx package)
- **Rates:** NBG API (ეროვნული ბანკი)
- **Language:** TypeScript

## ფოლდერის სტრუქტურა
```
assistant-ge/
├── app/
│   ├── page.tsx                          # root → redirect to /dashboard
│   ├── globals.css                       # dark theme, სრული CSS სისტემა
│   ├── layout.tsx                        # root layout
│   ├── auth/
│   │   ├── login/page.tsx               # ✅ მუშაობს
│   │   ├── register/page.tsx            # ✅ მუშაობს
│   │   └── callback/route.ts            # ✅ Supabase OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx                   # DashboardHeader + profile fetch
│   │   ├── page.tsx                     # ✅ org კარტები (გასწორდა)
│   │   └── importer/page.tsx            # TBC importer (org param)
│   └── admin/
│       ├── layout.tsx                   # admin guard
│       └── page.tsx                     # ✅ admin პანელი
├── components/
│   ├── DashboardHeader.tsx              # ✅ sticky header, logout, admin link
│   ├── OrgCard.tsx                      # ✅ org card, countdown bar
│   ├── RequestOrgButton.tsx             # org მოთხოვნის ღილაკი
│   ├── CreateOrgForm.tsx                # ახალი org-ის შექმნა (credit-ით)
│   ├── admin/
│   │   └── AdminUsersTable.tsx          # ✅ სრული admin UI
│   └── importer/
│       └── TbcImporter.tsx             # ✅ სრული TBC importer
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # browser client
│   │   ├── server.ts                   # server component client
│   │   └── admin.ts                    # service role client (RLS bypass)
│   └── types.ts                        # DB types
├── middleware.ts                        # ✅ route protection + admin guard
└── app/api/
    ├── organizations/create/route.ts   # POST: org შექმნა
    ├── admin/grant-credit/route.ts     # POST: credit დამატება
    └── admin/rename-org/route.ts       # POST: org გადარქმევა
```

## Supabase Schema (უკვე გაშვებული)

### ცხრილები
```sql
profiles        -- auth.users extension: email, full_name, phone, is_admin
organizations   -- user_id, name, is_demo, is_active, activated_at, expires_at
credits         -- user_id, granted_by, amount, note
org_requests    -- user_id, status(pending/approved/rejected), message
```

### მნიშვნელოვანი ლოგიკა
- ახალი user → trigger → profile + Demo org ავტომატურად
- `is_admin = true` → `Astonmartin2009@gmail.com` (უკვე დაყენებული)
- RLS ჩართულია ყველა ცხრილზე
- Admin routes იყენებს `createAdminClient()` (service role, RLS bypass)

## ბიზნეს ლოგიკა

### Demo vs Paid
| | Demo | Paid |
|---|---|---|
| ფასი | უფასო | 100₾ |
| ჩანაწერები | 10 | ულიმიტო |
| Export | ❌ | ✅ |
| ვადა | უვადო | 365 დღე |
| Renewal | — | 20₾ |

### Flow
1. User რეგისტრაცია → Demo org ავტომატურად
2. Paid org-ისთვის: user გზავნის request → admin ამტკიცებს → credit ემატება → user ქმნის org-ს
3. 365 დღის შემდეგ org expire → is_active=false → 6 თვე ინახება

## .env.local (საჭირო variables)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## რა არის გასაკეთებელი

### 1. RequestOrgButton.tsx — შევამოწმე, შეიძლება არასრული იყოს
`components/RequestOrgButton.tsx` — client component, რომელიც POST-ს უგზავნის `/api/org-requests/create`-ს (ან მსგავს route-ს). დარწმუნდი რომ:
- API route არსებობს
- pending state სწორად ჩანს

### 2. CreateOrgForm.tsx — credit-ის გამოყენება
`components/CreateOrgForm.tsx` — client component:
- სახელის input
- POST → `/api/organizations/create`
- credit-ის ჩამოჭრა + org შექმნა + `activated_at = now()`, `expires_at = now() + 365 days`

### 3. API route: `/api/organizations/create`
უნდა:
1. auth check
2. credit check (available credits > 0)
3. INSERT organizations (is_demo=false, activated_at, expires_at)
4. credit-ის დებეტი (ან ბიზნეს ლოგიკა — credit count vs paid orgs)

### 4. Admin: org request-ების approve/reject
`AdminUsersTable.tsx`-ში pending request-ების დამტკიცება/უარყოფა ჯერ არ არის იმპლემენტირებული:
- "დამტკიცება" → request status = 'approved' + credit +1
- "უარყოფა" → request status = 'rejected'
- API route: `/api/admin/approve-request`

### 5. Expired org renewal flow
Dashboard-ზე expired org-ისთვის "განახლება (20₾)" ღილაკი + admin-ის მხრიდან renewal

### 6. globals.css — CSS classes
`globals.css`-ში უნდა იყოს ეს class-ები (TbcImporter და სხვა კომპონენტები იყენებს):
```css
.btn, .btn-primary, .btn-ghost, .btn-success, .btn-sm
.input
.badge, .badge-active, .badge-demo, .badge-expired, .badge-pending
.table-wrap table thead th / tbody td
.toast, .toast.success, .toast.error
.spinner
```

### 7. Vercel Deploy
```bash
# environment variables Vercel-ზე:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## NBG Rate API
```
GET https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/?currencies=USD&date=2024-01-15
Response: [{ currencies: [{ rate: 2.7134 }] }]
```

## TBC Excel ფაილის სტრუქტურა
- Sheet 1: Summary (გამოტოვება)
- Sheet 2: ტრანზაქციები (index 1)
- Row 0-1: headers, data starts row 2
- Columns: `[0]=date, [1]=description, [3]=paidOut, [4]=paidIn, [6]=txType, [8]=ref, [9]=partnerAcc, [10]=partner, [11]=partnerTax, [22]=txId`

## FINS Export ფორმატი (headers)
```
['თარიღი*','დოკუმენტი','ანგ. დებეტი*','დასახელება','ანგ. კრედიტი*','დასახელება',
 'თანხა*','ვალუტა*','კურსი*','რაოდენობა','ერთეული','ერთეულის ფასი',
 'დანიშნულება','ობიექტი*','ზემოქმედი','კავშირი','შექმინს თარიღი']
```

## მიმდინარე სტატუსი
- ✅ Auth სრულად მუშაობს
- ✅ Supabase schema გაშვებული
- ✅ Admin profile დაყენებული (Astonmartin2009@gmail.com)
- ✅ Demo org შექმნილია DB-ში
- ✅ Dashboard org კარტები ჩანს
- ✅ TbcImporter სრული კოდი
- ✅ Admin პანელი სრული კოდი
- ⚠️ RequestOrgButton — შეამოწმე API route
- ⚠️ CreateOrgForm — შეამოწმე credit ლოგიკა
- ⚠️ Admin approve/reject — არ არის
- ⏳ Vercel deploy — ბოლო ნაბიჯი

## დეველოპმენტი
```bash
npm install
npm run dev
# localhost:3000
```
