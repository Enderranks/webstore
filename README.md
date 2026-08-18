# Underline Employee Store

Initial Next.js foundation for the private Underline merchandise portal.

## Current setup

- Branded employee dashboard shell at `/`
- Fourthwall-backed store route at `/store`
- Server-side Storefront API client in `lib/fourthwall.ts`
- HMAC-SHA256 webhook endpoint at `/api/webhooks/fourthwall`
- Strict cart allowance lock with server-side validation at `/api/cart/validate`
- Protected Excel sync endpoint at `/api/integrations/excel/sync`
- Excel used-budget write-back hook through Power Automate
- Prisma/MySQL schema for employees, teams, departments, allowance ledger, carts, orders, webhook events, and audit logs
- `.env.example` with the required integration variables

## Run locally

```bash
npm install
copy .env.example .env.local
npm run db:generate
npm run dev
```

The homepage is intentionally usable without credentials. The `/store` page switches to live Fourthwall products when `FOURTHWALL_STOREFRONT_TOKEN` is configured.

## Live Excel sync

Keep the employee workbook in OneDrive or SharePoint and format the employee range as an Excel Table. Use only the `Employee` and `Employee details` sheets for the store integration; ignore the `Team` sheet. Use Power Automate to trigger when a row is added or modified, transform the row into the JSON shape below, and send it to the sync endpoint with the `x-excel-sync-secret` header. The endpoint upserts by `employeeId`, creates missing teams/departments, updates the current allowance, and marks non-active employees as unable to access the store.

```json
{
  "source": "underline-employee-workbook",
  "rows": [{
    "employeeId": "SC-1042",
    "firstName": "Jordan",
    "lastName": "Doe",
    "email": "jordan.doe@underline.com",
    "employmentStatus": "ACTIVE",
    "team": "ShadowCore",
    "department": "Engineering",
    "position": "Backend Developer",
    "level": "L3",
    "annualAllowanceCents": 15000,
    "allowanceExpiresAt": "2026-12-31T23:59:59.000Z"
  }]
}
```

Do not sync `allowanceUsed` from Excel. Order deductions and refunds must remain in the application ledger so a workbook edit cannot erase purchase history.

## Used-budget write-back

Create a second Power Automate flow with an HTTP trigger and set its URL as `EXCEL_WRITEBACK_URL`. The app sends `employeeId`, `incrementUsedBudgetCents`, `orderId`, and an idempotency key after `ORDER_PLACED`. The flow should:

1. Reject requests without the shared `x-excel-sync-secret`.
2. Look up the employee row by the canonical Employee Number.
3. Check an order-id log to prevent duplicate updates.
4. Add `incrementUsedBudgetCents / 100` to the `used budget` cell.
5. Record the order ID as processed.

The flow should update the Excel `Employee details` table only after the Fourthwall order is confirmed and paid. Refund and cancellation flows should later send a negative adjustment through the same idempotent mechanism.

## Important integration boundary

Fourthwall owns hosted checkout and payment. This foundation does not pretend that an internal allowance can be applied to the Fourthwall checkout total. Before implementing checkout completion, verify whether the shop can represent the employee benefit through a supported coupon, discount, gift card, or company-paid flow. Cart metadata is reserved for `employee_id` and `internal_cart_id`, and must be verified in a test order before allowance deduction is enabled.
