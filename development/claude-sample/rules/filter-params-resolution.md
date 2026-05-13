---
description: Filter params resolution rules — apply when building MongoDB queries from accountId, marketplace, or clientId filter params in any service.
globs: ["packages/api/src/services/*.ts", "packages/api/src/controllers/*.ts"]
---

# Filter Params — Resolution Rules

## accountId takes precedence over marketplace

The GlobalFilterBar always derives `marketplace` automatically from the selected store and sends **both** `accountId` and `marketplace` in the same request. If a service expands by marketplace when `accountId` is already present, it unions in every store on that platform — silently breaking the account filter.

**Always use `if/else if` — never union `accountId` and `marketplace` together:**

```typescript
// ✅ Correct — accountId is authoritative
if (accountIds?.length) {
  effectiveAccountIds = new Set<string>(accountIds);
} else if (marketplaces?.length) {
  // Only expand by marketplace when no explicit accounts were provided
  const accts = await PlatformAccountModel.find({ tenantId, platform: { $in: marketplaces } }).select('_id');
  accts.forEach((a) => effectiveAccountIds.add(String(a._id)));
}

// ❌ Wrong — marketplace expansion overrides the specific account filter
const set = new Set<string>();
if (accountIds) accountIds.forEach((id) => set.add(id));
if (marketplaces) {
  const accts = await PlatformAccountModel.find({ tenantId, platform: { $in: marketplaces } }).select('_id');
  accts.forEach((a) => set.add(String(a._id))); // adds ALL stores on the platform
}
```

## Param name: accountId (new) vs platformAccountId (legacy)

The GlobalFilterBar sends `accountId` (multi-value `string[]`). The legacy single-value param is `platformAccountId`. When reading filter params in a controller, always read `accountId` first and fall back to `platformAccountId`:

```typescript
// ✅
const rawAccountId = req.query.accountId;
const accountIds = rawAccountId != null
  ? (Array.isArray(rawAccountId) ? rawAccountId : [rawAccountId])
  : legacyPlatformAccountId ? [legacyPlatformAccountId] : null;

// ❌ — GlobalFilterBar sends 'accountId', this silently receives nothing
const { platformAccountId } = req.query;
```

## Every filter-accepting endpoint must forward accountId/marketplace

Controllers that accept the shared `FilterParamsSchema` (dashboard, orders, closeout, analytics) **must** resolve and forward `accountId` and `marketplace` to the service layer. Parsing them via Zod and then not using them is a silent filter bypass.

Checklist when adding a new filtered endpoint:
- [ ] Controller reads `parsed.accountId` (not raw `req.query.platformAccountId`)
- [ ] `accountId` takes precedence — no marketplace expansion when accountId is present
- [ ] Service param is `accountIds: string[]`, not a single string
- [ ] MongoDB query uses `{ $in: accountIds }` or scalar when length is 1

Forbidden: unioning `accountId` and `marketplace` · reading only `platformAccountId` from query · parsing filter params but not passing them to the service.
