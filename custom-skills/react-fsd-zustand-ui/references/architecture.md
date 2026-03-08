# Architecture Reference

## FSD placement rules

### app/
Use for:
- app bootstrap
- providers
- routing
- global styles
- app-wide config

### pages/
Use for:
- route-level UI
- page-specific data fetching
- page-only forms and validation
- business logic used only by that page
- large UI blocks used only there

### widgets/
Use for:
- large reusable page sections
- composite UI blocks reused across pages
- widget-specific state and API calls

### features/
Use for:
- reusable user interactions
- self-contained business actions
- behavior used in multiple places

Examples:
- auth form
- add to cart
- create comment
- like button

### entities/
Use for:
- reusable business-domain concepts
- domain model + UI + model + API around that concept

Examples:
- user
- product
- order

### shared/
Use for:
- UI kit
- generic helpers
- API client
- config
- assets
- common types

Do not put business logic here.

---

## Import rules
Imports should go downward only:
- `pages` can import `widgets`, `features`, `entities`, `shared`
- `features` can import `entities`, `shared`
- `entities` can import `shared`

Avoid same-layer slice coupling.
If a same-layer relationship is truly necessary, make it explicit and controlled.

---

## Slice shape
Typical slice structure:
```text
features/some-feature/
├── ui/
├── api/
├── model/
├── lib/
├── config/
└── index.ts
```

## Public API rule
External consumers should import from the slice `index.ts`, not internal files.

Example:
```ts
// features/auth/index.ts
export { LoginForm } from './ui/LoginForm'
export { useAuthStore } from './model/store'
```

---

## Placement decision tree

### Start here:
Is this used in only one page?
- yes → keep it in that page

Is this a reusable composite block across pages?
- yes → `widgets/`

Is this a reusable user interaction?
- yes → `features/`

Is this a reusable domain concept?
- yes → `entities/`

Otherwise:
- infrastructure or generic utility → `shared/`

---

## Refactor rules
Do not over-extract.
Prefer moving code only after reuse becomes real, not hypothetical.
Keep related logic close to where it is used until reuse forces separation.
