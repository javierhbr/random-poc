---
paths:
  - "packages/web/src/**/*.ts"
  - "packages/web/src/**/*.tsx"
---

# Zustand State Management Rules

## ⛔ RE-RENDER PREVENTION — Read Before Writing Any Component

These are the root causes of `Maximum update depth exceeded` and infinite re-renders. Violating any one of them creates cascading failures.

1. **Never subscribe to the full store** — `const store = useXStore()` is **FORBIDDEN**. Re-renders on every store mutation, even unrelated ones.
2. **One `useXStore(selector)` call per value** — each subscription is independent; React only re-renders when that specific primitive changes.
3. **All selectors must be named exports from the store file** — inline arrows (`s => s.action`) create a new function reference every render, defeating memoization.
4. **`useShallow` for multi-value calls** — `useStore(useShallow(s => ({ a: s.a, b: s.b })))`. Without it every render returns a new object reference → consumers re-render.
5. **Memoize custom hook return objects** — `return useMemo(() => ({ ... }), deps)`. A plain object literal return creates a new reference every render.
6. **`useEffect` deps: primitives only** — Never put store objects, service instances, or `useCallback` results in deps. They get new references every render → effect re-runs infinitely.
7. **Hooks at top level only** — Never call a hook inside `useMemo`, `useCallback`, or `useEffect`. Error: `Rendered more hooks than during the previous render`.

**Quick diagnosis**: React DevTools Profiler → record → any component with 50+ renders → "Why did this render?" → if the answer is a function or object, you have a violation above.

---

## MANDATORY: Before Writing Any Component That Touches a Store

**Stop. Run this checklist before writing a single line of component code.**

- [ ] Identify every store this component will touch
- [ ] For each store action/selector needed, confirm a named selector is exported from the store file
- [ ] If no selector exists, add it to the store file FIRST
- [ ] Plan every `usePlatformStore(...)` call — one call per action, one call per piece of state
- [ ] Confirm zero full-store destructures: `const store = useXStore()` is FORBIDDEN

**Matching surrounding code that violates these rules is NOT acceptable. Rules take precedence over consistency with broken code.**

## MANDATORY: When Modifying an Existing File

If you edit a component file that contains full-store destructures or missing selectors, fix all violations in the functions/components you touch — not the whole file, but not "out of scope" either. You modified the file; you own the Zustand patterns in the code you changed.

---

## The One Rule That Prevents All Infinite Re-Renders

**Never subscribe to the whole store. Every subscription must be selective.**

```typescript
// ❌ FORBIDDEN — component re-renders on ANY store change, causes infinite loops
const store = usePlatformStore();
const { updateAccount, freezeAccount, setupEbayNotifications } = store;

// ✅ REQUIRED — one call per action/value
const updateAccount = usePlatformStore(selectUpdateAccount);
const freezeAccount = usePlatformStore(selectFreezeAccount);
const setupEbayNotifications = usePlatformStore(selectSetupEbayNotifications);
```

## Named Selectors Are Required (Not Optional)

Every store action or state value used by a component MUST have a named selector exported from the store file.

```typescript
// ✅ In the store file — define and export selectors
export const selectPlatforms = (s: PlatformState & PlatformActions) => s.platforms;
export const selectUpdateAccount = (s: PlatformState & PlatformActions) => s.updateAccount;
export const selectFreezeAccount = (s: PlatformState & PlatformActions) => s.freezeAccount;
export const selectSetupEbayNotifications = (s: PlatformState & PlatformActions) => s.setupEbayNotifications;

// ✅ In the component — import selectors, one subscription per value
import { selectUpdateAccount, selectFreezeAccount, selectSetupEbayNotifications } from '../stores/platformStore';

const updateAccount = usePlatformStore(selectUpdateAccount);
const freezeAccount = usePlatformStore(selectFreezeAccount);
const setupEbayNotifications = usePlatformStore(selectSetupEbayNotifications);

// ❌ FORBIDDEN — inline arrow function, no reuse, no stable reference
const setupEbayNotifications = usePlatformStore(s => s.setupEbayNotifications);
```

## Store Updates After Mutations

When a store action mutates data, the store state must be updated directly — not via a prop callback. `onUpdated` callbacks only set IDs; they do NOT update the store.

```typescript
// ✅ Update both data arrays in the store so derived selectors recompute
set((state) => {
  const patch = (a: PlatformAccount) =>
    a.id === accountId ? { ...a, ebayNotificationsSetupAt: now } : a;
  return {
    platforms: state.platforms.map(patch),
    customerMarketplaces: Object.fromEntries(
      Object.entries(state.customerMarketplaces).map(([cid, accts]) => [cid, accts.map(patch)])
    ),
  };
});

// ❌ WRONG — calling onUpdated(updatedAccount) only changes the selected ID,
//            doesn't update customerMarketplaces, so the modal re-renders with stale data
```

## Cache Metadata (data stores only)

```typescript
_dataFamilyId: string | null;   // which family's data is cached
_lastFetchTime: number | null;  // timestamp of last fetch
error: string | null;
```

Always check `isCacheValid()` before fetching. Never fetch unconditionally on mount.

## useEffect Dependencies — Primitives Only

```typescript
// ✅ Primitives only
useEffect(() => { loadData(userId); }, [userId]);

// ❌ Objects or store references in deps — re-runs every render
useEffect(() => { loadData(); }, [store]);
useEffect(() => { loadData(); }, [fetchFn]); // fetchFn = useCallback → recreated on dep change
```

## AbortController Must Reach the Network

```typescript
// ✅ Signal reaches the HTTP client
useEffect(() => {
  const controller = new AbortController();
  store.getState().fetch(familyId, { signal: controller.signal });
  return () => controller.abort();
}, [familyId]);

// ❌ Abort only guards setState — HTTP request still fires twice in StrictMode
useEffect(() => {
  const controller = new AbortController();
  store.getState().fetch(familyId); // signal never passed
  return () => controller.abort();  // no-op for the network
}, [familyId]);
```

When signal threading is not feasible, use module-level in-flight deduplication:

```typescript
let _inflight: Promise<void> | null = null;
let _inflightKey: string | null = null;

fetchData: async (key) => {
  if (_inflight && _inflightKey === key) return _inflight;
  const promise = (async () => {
    try { /* fetch */ } finally { _inflight = null; _inflightKey = null; }
  })();
  _inflight = promise; _inflightKey = key;
  return promise;
}
```

## Multiple Values — Use useShallow

```typescript
// ✅ Shallow comparison prevents re-renders when values are unchanged
const { data, error } = useStore(useShallow(s => ({ data: s.data, error: s.error })));

// ❌ New object on every render
const { data, error } = useStore(s => ({ data: s.data, error: s.error }));
```

## Custom Hooks — Memoize Returned Objects

```typescript
// ✅ Stable reference
return useMemo(() => ({ currentUser, login, logout }), [currentUser, login, logout]);

// ❌ New object every render, cascades re-renders in consumers
return { currentUser, login, logout };
```

## Local vs Store State

- Local UI state (modal open, loading spinner, form values) → `useState`
- Shared/persistent data (accounts, orders, filters) → Zustand

Never put `isLoading` for a single action in the store. Use `const [isLoading, setIsLoading] = useState(false)` in the component.

## Anti-Patterns (FORBIDDEN)

| # | Anti-Pattern | Why | Fix |
|---|---|---|---|
| 1 | `const store = useXStore()` | Re-renders on any change | One `useXStore(selector)` per value |
| 2 | Inline `s => s.action` (no export) | Not reusable; no memoization signal | Export named selector |
| 3 | `useCallback` in `useEffect` deps | Creates new ref → runs effect → loops | Depend on primitives |
| 4 | Store object in `useEffect` deps | New reference every render | Depend on primitive extracted from store |
| 5 | `onUpdated(result)` to refresh modal | Only sets ID, skips store update | Patch store in action directly |
| 6 | Skip cache check before fetch | Double-fetches on every mount | `isCacheValid()` first |
| 7 | Async effect without cleanup | Memory leak / stale setState | Return `() => controller.abort()` |
| 8 | AbortController not reaching HTTP | StrictMode fires effect twice | Thread signal to apiClient |
| 9 | Hooks inside `useMemo`/`useCallback`/`useEffect` | Violates Rules of Hooks | Call hooks at top level |
| 10 | Skip fixing violations in touched files | Violations compound | Fix in code you modify |

---

## Data vs Infrastructure Stores

**Data stores** (Tasks, Categories, Rewards, Orders):
- ❌ NO `isLoading` — multiple components share the store and would see each other's loading state
- ✅ Cache metadata: `_dataFamilyId`, `_lastFetchTime`
- ✅ `isCacheValid()` — always check before fetching
- ✅ Exported selectors

**Infrastructure stores** (Auth, Family, Notifications, UI):
- ✅ `isLoading` IS allowed — tracks app lifecycle state, not per-request operations
- ✅ Subscription tracking (`_subscribedUserId`)
- ✅ Real-time listener management

---

## `createCacheSlice` Factory (DRY — required for new data stores)

Never hand-roll `_dataKey`, `_lastFetchTime`, `isCacheValid`, `setCacheSuccess`, `setCacheError`, `resetCache`. Compose the factory instead:

```typescript
export const useTasksStore = create<TasksState & CacheSlice & TasksActions>()(
  immer((...args) => ({
    ...createCacheSlice(...args), // injects all cache logic
    tasks: [],
    fetch: async (familyId, service, { force, signal } = {}) => {
      const [set, get] = args;
      if (!force && get().isCacheValid(familyId)) return;
      try {
        const tasks = await service.getTasks(familyId, { signal });
        set((s) => { s.tasks = tasks; });
        get().setCacheSuccess(familyId);
      } catch (err) {
        if (err.name === 'AbortError') return;
        get().setCacheError(err);
        throw err;
      }
    },
  }))
);
```

---

## `useStoreData` Hook Pattern

Components never call `store.fetch()` directly. All fetch orchestration goes through a central hook:

```typescript
export function useStoreData(storeTypes: StoreType[]) {
  const familyId = useFamilyStore(selectFamilyId); // primitive
  const [loadingStores, setLoadingStores] = useState<Set<StoreType>>(new Set());

  const fetchTasks = useTasksStore((s) => s.fetch);     // stable store ref
  const isTasksCacheValid = useTasksStore((s) => s.isCacheValid);

  useEffect(() => {
    if (!familyId) return;
    const controller = new AbortController();

    (async () => {
      const toFetch = storeTypes.filter(t => t === 'tasks' && !isTasksCacheValid(familyId));
      if (!toFetch.length) return;
      setLoadingStores(new Set(toFetch));
      await Promise.allSettled(toFetch.map(async (type) => {
        try {
          if (type === 'tasks') await fetchTasks(familyId, dataService, { signal: controller.signal });
        } catch (err) {
          if (err.name !== 'AbortError') console.error(`Error fetching ${type}:`, err);
        } finally {
          setLoadingStores(prev => { const next = new Set(prev); next.delete(type); return next; });
        }
      }));
    })();

    return () => controller.abort();
  }, [familyId]); // ✅ only primitive in deps

  return { isLoading: loadingStores.size > 0 };
}
```

---

## Middleware Order

```typescript
// ✅ devtools outermost → immer innermost
export const useStore = create<State & Actions>()(
  devtools(
    immer((set, get) => ({ /* ... */ })),
    { name: 'StoreName', enabled: process.env.NODE_ENV === 'development' }
  )
);
```

Wrong order (immer outside devtools) breaks Redux DevTools inspection.
