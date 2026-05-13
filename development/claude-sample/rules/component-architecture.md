---
paths:
  - "src/**"
---

# Component Architecture Rules (FSD + React)

## FSD Layer Placement

| Layer | Use for |
|-------|---------|
| `app/` | Bootstrap, providers, routing, global styles, app-wide config |
| `pages/` | Route-level UI, page-specific data fetching, logic used only there |
| `widgets/` | Large reusable page sections, composite UI across multiple pages |
| `features/` | Reusable user interactions (auth form, add to cart, like button) |
| `entities/` | Reusable business-domain concepts (user, product, order) |
| `shared/` | UI kit, generic helpers, API client, config, assets, common types |

**Import direction: downward only** — `pages` → `widgets` → `features` → `entities` → `shared`
No same-layer slice coupling. External consumers import from slice `index.ts` only.

## "Pages First" Rule

```
Is it used in only one page?       → keep it in that page
Is it a reusable composite block?  → widgets/
Is it a reusable user interaction? → features/
Is it a reusable domain concept?   → entities/
Is it infrastructure/generic?      → shared/
```

**Extract only when reuse is real, not hypothetical.**

## When to Use `useEffect`

✅ Only for syncing with external systems:
- Browser APIs (DOM, timers)
- Subscriptions
- Analytics on screen appearance
- Third-party imperative widgets
- Data fetching (when no better mechanism exists)

❌ Never for:
- Deriving values from props/state → compute during render instead
- Reacting to button clicks/form submits → use event handlers
- Resetting state on prop change → use `key` prop instead
- Expensive calculations → use `useMemo`

## State Decision

Before adding state, ask:
- Can it be computed during render? → no state needed
- Can it be derived from props? → no state needed
- Is it local to one component? → use `useState`
- Is it shared across multiple components? → use Zustand

## Async UI Rendering Order

```tsx
// ✅ Always this order
if (error) return <ErrorState error={error} onRetry={refetch} />
if (loading && !data) return <LoadingState />
if (!data?.items.length) return <EmptyState />
return <ItemList items={data.items} />

// ❌ Never: if (loading) return <Spinner /> — causes stale-data flash on refetch
```

## UI Checklist (before finishing a component)

- [ ] Error state exists and renders correctly
- [ ] Empty state exists for every list/collection
- [ ] Loading shown only when no data present
- [ ] Buttons disabled during async operations (`disabled={isSubmitting}`)
- [ ] User receives visible feedback after mutations (toast/snackbar)
- [ ] Never swallow errors silently

## Error Surface (smallest correct level)

1. Field-level inline error
2. Toast for recoverable action failure
3. Banner for page-level partial failure
4. Full-screen error for unrecoverable failure

## Skeleton vs Spinner

- **Skeletons** — content shape is known (cards, tables, lists)
- **Spinners** — content shape unknown, or small/local action (button, modal)
