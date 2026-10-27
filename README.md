# Bossly admin console

Internal Nuxt 3 + TypeScript + Tailwind + Pinia console for the Bossly platform team. Dark-first, mobile-responsive, installable PWA, `noindex`.

## Run

```bash
pnpm install
cp .env.example .env
pnpm dev:admin
```

- URL: http://localhost:3101
- API: `http://localhost:4100/api/v1`
- Build: `pnpm --filter @bossly/admin build`
- Typecheck: `pnpm --filter @bossly/admin lint`

Use the seeded super admin (`admin@bossly.ng` / `ChangeMe123!` by default). Change it for any shared environment.

## Access model

- `super_admin`: full read/write — change plans, extend trials, suspend businesses, grant coupons, update users, retry webhooks.
- `support`: read-only. Write controls are hidden and the backend rejects writes.

Every successful write records an audit log with actor, action, entity and metadata.

## What it does

- **Overview**: users/businesses growth, MRR, 30-day revenue, plan distribution, integration status, top businesses, WhatsApp health, webhook failures, recent audit.
- **Affiliates & payouts**: programme totals, top affiliates, payout requests, mark paid/rejected, CSV exports.
- **Users**: search/filter, profile detail, business memberships, platform role, disable/enable (revokes refresh sessions).
- **Businesses**: plan, subscription, usage, members, payments, audit; plan changes, trial extensions, suspension/restore, coupon grants.
- **Plans & coupons**: edit entitlements, prices, trial rules, Paystack plan codes, marketing features, create plans; issue/revoke coupons.
- **Payments**: all Paystack references by status/purpose, success/pending/failed summaries.
- **WhatsApp health**: Cloud API config, 24h inbound/outbound/failed counts, linked numbers, template names, recent outbound failures, webhook event log with retry.
- **Audit log**: filter by action, business or actor; metadata included; CSV export.
- **Impersonation**: super admins can open a 15-minute, audited owner session (no refresh token). Every action is tagged with the impersonator in audit metadata.
- **Support notes**: internal, pinned notes on users and businesses; never exposed to customers.
- **CSV exports**: users, businesses, payments, audit, affiliates and payouts, with spreadsheet-formula injection protection.

## Architecture

Same conventions as the web app:

```
api/http.ts           single axios instance, refresh + normalised errors
api/adminApi.ts       platform API factory
composables/useAdmin.ts  one composable per use case
stores/auth.ts        platform session
components/           UI primitives, console layout, charts, support notes
pages/                route-level pages only
```

No page imports axios or the API factory directly; strict TypeScript; mobile drawer navigation; keyboard-accessible modals; visible focus states; light/dark theme toggle.

## Security

- Separate auth endpoint (`/auth/platform/login`) rejects non-platform accounts.
- Admin token storage is namespaced separately from the business app.
- Backend enforces platform roles; the UI hiding is convenience, not security.
- Console is `noindex,nofollow` and intended for private hosting/IP allowlisting where possible.
