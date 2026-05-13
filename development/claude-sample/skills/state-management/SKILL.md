---
name: state-management
description: Zustand state management patterns that prevent infinite loops, redundant API calls, and React Hooks violations. Auto-activates when working with stores or hooks.
---

# State Management Skill: Quick Reference

This skill provides essential Zustand patterns to prevent infinite loops, redundant API calls, and memory leaks. Use when creating/modifying stores, hooks, or fixing re-render issues.

## 🎯 Critical Principles

### Two Core Problems to Solve

1. **Prevent Infinite Re-Renders**
   - Use selective subscriptions (NEVER subscribe to entire store)
   - Memoize returned objects
   - Only primitive values in useEffect dependencies

2. **Prevent Multiple API Calls**
   - Implement cache validation with `_dataFamilyId` and `_lastFetchTime`
   - Check cache before fetching
   - Use `force` option only for signal updates

### Data Flow Pattern

```
Page (mount) → useStoreData(['tasks']) → Check cache
                    ↓ (if invalid)
                Store.fetch() → Firestore → Update metadata
                    ↓
            Components subscribe selectively
```

## ❌ Top 10 Critical Anti-Patterns

### 1. Full Store Destructuring → Infinite Loops

```typescript
// ❌ BAD - Subscribes to ENTIRE store
const userState = useUserStore();
return { currentUser: userState.currentUser };

// Component re-renders on ANY store change
```

**Why bad:** Creates new object on every render, causes cascading re-renders.

**Error:** "Maximum update depth exceeded"

---

### 2. useCallback in useEffect Dependencies → Infinite API Calls

```typescript
// ❌ BAD
const fetchData = useCallback(async () => {
  await api.getData();
}, [familyId]); // Function recreated when familyId changes

useEffect(() => {
  fetchData();
}, [fetchData]); // Loop: fetchData changes → effect runs → re-render
```

**Why bad:** useCallback recreates function when dependencies change, triggers useEffect infinitely.

**Fix:** Depend only on primitives, not the callback function.

---

### 3. Missing Cache Validation → Redundant Fetches

```typescript
// ❌ BAD
useEffect(() => {
  fetchData(familyId, service); // Always fetches without checking cache
}, [familyId]);
```

**Why bad:** Fetches every render, ignores loaded data, wastes bandwidth.

---

### 4. Hooks Inside Hooks → Rules of Hooks Violations

```typescript
// ❌ BAD
export const useUser = () => {
  return useMemo(() => ({
    // NEVER call hooks inside useMemo/useCallback/useEffect
    getUsersByRole: useCallback(() => { ... }, []),
  }), []);
};
```

**Error:** "Rendered more hooks than during the previous render"

---

### 5. Store Object in useEffect Dependencies → Infinite Loops

```typescript
// ❌ BAD
const store = useStore(); // Object changes on every render

useEffect(() => {
  loadData();
}, [store]); // Runs infinitely
```

**Why bad:** Store object is new reference on every render.

---

### 6. Multiple Unstable Dependencies → Excessive Re-runs

```typescript
// ❌ BAD
useEffect(() => {
  loadData();
}, [
  familyId,
  dataService, // Object changes on every render
  healthService, // Object changes on every render
  fetchTasks, // Function may change
  // ... 15 total dependencies
]);
```

**Why bad:** useEffect runs on every parent render.

---

### 7. Async Without Cleanup → Memory Leaks

```typescript
// ❌ BAD
useEffect(() => {
  const loadData = async () => {
    const data = await service.getData();
    setState(data); // May execute after unmount
  };
  loadData();
}, [deps]); // Without cleanup function
```

**Error:** "Can't perform React state update on unmounted component"

---

### 8. Missing Exported Selectors → Performance Issues

```typescript
// ❌ BAD - Inline selector
const tasks = useTasksStore((state) => state.tasks);

// Creates new function on every render
```

**Why bad:** No memoization, harder to maintain.

---

### 9. Manual Cache Reinvention → DRY Violations

```typescript
// ❌ BAD - Duplicated in every store
export const useTasksStore = create((set, get) => ({
  _dataFamilyId: null,
  _lastFetchTime: null,
  isCacheValid: (familyId) => {
    /* duplicated code */
  },
}));

// Same code in categoriesStore, rewardsStore, etc.
```

**Why bad:** 60% repeated code, human errors, difficult maintenance.

---

### 10. Functions in Dependencies → Infinite Loops

```typescript
// ❌ BAD
const action = useCallback(() => { ... }, [dep]);

useEffect(() => {
  action();
}, [action]); // Infinite loop when dep changes
```

**Why bad:** Function reference changes when dependencies change.

---

### 11. AbortController That Doesn't Reach the Network → Silent Double Fetch

```typescript
// ❌ BAD
useEffect(() => {
  const controller = new AbortController();
  const loadData = async () => {
    setIsLoading(true);
    try {
      await store.getState().fetchData(); // signal never passed in
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };
  loadData();
  return () => controller.abort(); // only guards setState, NOT the HTTP call
}, [deps]);
```

**Why bad:** React StrictMode fires `useEffect` twice in development (run → cleanup → run). `controller.abort()` in cleanup only prevents the `setIsLoading(false)` state update — the actual `apiClient.get` inside `fetchData()` is never cancelled. Both invocations hit the network. You get two identical requests with identical responses; in production this is fine, but in development it creates confusing noise and can cause race conditions if the store action has side effects.

**Root cause:** The `AbortSignal` is not threaded from the component through the store action to the HTTP client.

---

## ✅ Top 10 Correct Patterns

### 1. Selective Subscriptions with Exported Selectors

```typescript
// ✅ CORRECT - In store file
export const selectCurrentUser = (state: UserState) => state.currentUser;
export const selectIsLoading = (state: UserState) => state.isLoading;

// In component
const currentUser = useUserStore(selectCurrentUser);
const isLoading = useUserStore(selectIsLoading);
```

**Why correct:** Only subscribes to specific values, predictable re-renders.

---

### 2. Cache Validation in Store

```typescript
// ✅ CORRECT
interface TasksState {
  tasks: Task[];
  _dataFamilyId: string | null;
  _lastFetchTime: number | null;
}

export const useTasksStore = create<TasksState & TasksActions>()(
  immer((set, get) => ({
    tasks: [],
    _dataFamilyId: null,
    _lastFetchTime: null,

    isCacheValid: (familyId: string) => {
      const { _dataFamilyId, _lastFetchTime } = get();
      if (_dataFamilyId !== familyId) return false;
      if (!_lastFetchTime) return false;
      return true;
    },

    fetch: async (familyId, service, options = {}) => {
      const { force = false } = options;

      // Check cache first
      if (!force && get().isCacheValid(familyId)) {
        console.debug('[Store] Valid cache, skipping fetch');
        return;
      }

      const tasks = await service.getTasks(familyId);
      set((state) => {
        state.tasks = tasks;
        state._dataFamilyId = familyId;
        state._lastFetchTime = Date.now();
      });
    },
  }))
);
```

**Why correct:** Prevents redundant API calls, tracks cache metadata.

---

### 3. AbortController for Async Cleanup

```typescript
// ✅ CORRECT
useEffect(() => {
  const controller = new AbortController();

  const loadData = async () => {
    try {
      const data = await fetchData({ signal: controller.signal });
      setState(data); // Only if not aborted
    } catch (err) {
      if (err.name === 'AbortError') return; // Normal cancellation
      console.error('Error:', err);
    }
  };

  loadData();

  return () => {
    controller.abort(); // Cancels HTTP request
  };
}, [deps]);
```

**Why correct:** Modern Web API standard, cancels real HTTP requests, prevents memory leaks.

---

### 4. Store Factories (createCacheSlice)

```typescript
// ✅ CORRECT - DRY cache logic
export const createCacheSlice: StateCreator<CacheSlice> = (set, get) => ({
  _dataKey: null,
  _lastFetchTime: null,
  error: null,

  isCacheValid: (key, ttl = 5 * 60 * 1000) => {
    const { _dataKey, _lastFetchTime } = get();
    if (_dataKey !== key) return false;
    if (!_lastFetchTime) return false;
    return Date.now() - _lastFetchTime < ttl;
  },

  setCacheSuccess: (key) =>
    set({
      _dataKey: key,
      _lastFetchTime: Date.now(),
      error: null,
    }),

  setCacheError: (err) =>
    set({
      error: err instanceof Error ? err.message : 'Unknown error',
    }),
});

// Usage in stores - 60% less code
export const useTasksStore = create<TasksState & CacheSlice>()(
  immer((...args) => ({
    ...createCacheSlice(...args), // Injects cache logic
    tasks: [],
    fetch: async (familyId, service, { force, signal } = {}) => {
      const [set, get] = args;
      if (!force && get().isCacheValid(familyId)) return;
      // ...
    },
  }))
);
```

**Why correct:** Eliminates 60% boilerplate, single source of truth, configurable TTL.

---

### 5. useStoreData Hook Pattern

```typescript
// ✅ CORRECT
export function useStoreData(storeTypes: StoreType[]) {
  const familyId = useFamilyStore(selectFamilyId);
  const [loadingStores, setLoadingStores] = useState<Set<StoreType>>(new Set());

  // Get methods (stable references)
  const fetchTasks = useTasksStore((s) => s.fetch);
  const isTasksCacheValid = useTasksStore((s) => s.isCacheValid);

  useEffect(() => {
    if (!familyId) return;
    const controller = new AbortController();

    const fetchStores = async () => {
      const toFetch: StoreType[] = [];

      // Check which stores need fetch
      if (storeTypes.includes('tasks') && !isTasksCacheValid(familyId)) {
        toFetch.push('tasks');
      }

      if (toFetch.length === 0) return; // All caches valid

      setLoadingStores(new Set(toFetch));

      // Parallel fetch
      await Promise.allSettled(
        toFetch.map(async (type) => {
          try {
            if (type === 'tasks') {
              await fetchTasks(familyId, dataService, { signal: controller.signal });
            }
          } catch (err) {
            if (err.name === 'AbortError') return;
            console.error(`Error fetching ${type}:`, err);
          } finally {
            setLoadingStores((prev) => {
              const next = new Set(prev);
              next.delete(type);
              return next;
            });
          }
        })
      );
    };

    fetchStores();

    return () => {
      controller.abort(); // Cancel HTTP requests on unmount
    };
  }, [familyId]); // Only re-runs when familyId changes

  return {
    isLoading: loadingStores.size > 0,
    loadingStores,
  };
}
```

**Why correct:** Checks cache before fetching, local loading state, stable function references.

---

### 6. Memoized Return Objects

```typescript
// ✅ CORRECT
export const useUser = () => {
  const currentUser = useUserStore(selectCurrentUser);
  const isLoading = useUserStore(selectIsLoading);

  const login = useUserStore((state) => state.login);
  const logout = useUserStore((state) => state.logout);

  // Define hooks at top level BEFORE useMemo
  const getUsersByRole = useCallback((role: string) => {
    return mockUsers;
  }, []);

  // Memoize returned object
  return useMemo(
    () => ({
      currentUser,
      isLoading,
      login,
      logout,
      getUsersByRole,
    }),
    [currentUser, isLoading, login, logout, getUsersByRole]
  );
};
```

**Why correct:** Follows Rules of Hooks, stable object reference, predictable re-renders.

---

### 7. Only Primitives in useEffect Dependencies

```typescript
// ✅ CORRECT
const userId = useStore((state) => state.currentUser?.id);
const familyId = useStore((state) => state.familyId);

useEffect(() => {
  if (userId && familyId) {
    loadUserData(userId, familyId);
  }
}, [userId, familyId]); // Only primitives (strings, numbers)
```

**Why correct:** Depends only on primitive values, predictable execution, doesn't cause loops.

---

### 8. Separate Data from Actions

```typescript
// ✅ CORRECT
const TaskComponent = ({ taskId }: { taskId: string }) => {
  // Data (cause re-render when changed)
  const task = useTasksStore(selectTaskById(taskId));

  // Actions (stable references, do not cause re-render)
  const updateTask = useTasksStore(state => state.updateTask);
  const deleteTask = useTasksStore(state => state.deleteTask);

  return (
    <div>
      <h3>{task?.title}</h3>
      <button onClick={() => updateTask(taskId, { completed: true })}>
        Complete
      </button>
    </div>
  );
};
```

**Why correct:** Minimizes re-renders, actions have stable references.

---

### 9. useShallow for Multiple Values

```typescript
import { useShallow } from 'zustand/react/shallow';

// ✅ CORRECT
const { data, error, loading } = useStore(
  useShallow((state) => ({
    data: state.data,
    error: state.error,
    loading: state.loading,
  }))
);
```

**Why correct:** Modern API (Zustand v4.5+), shallow comparison prevents unnecessary re-renders.

---

### 10. DevTools Middleware

```typescript
// ✅ CORRECT
import { devtools } from 'zustand/middleware';

export const useTasksStore = create<TasksState & TasksActions>()(
  devtools(
    immer((set, get) => ({
      // ... store implementation
    })),
    {
      name: 'TasksStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
```

**Why correct:** Time-travel debugging, state inspection, only in development.

---

### 11. In-flight Deduplication (when signal threading isn't feasible)

When the store action wraps a client that doesn't accept `AbortSignal`, deduplicate concurrent requests at the store level with a module-level promise keyed by cache key:

```typescript
// ✅ CORRECT — module-level, outside create()
let _inflight: Promise<void> | null = null;
let _inflightKey: string | null = null;

export const useDataStore = create<DataState & DataActions>((set, get) => ({
  // ...
  fetchData: async (options = {}) => {
    const { filters, force = false } = options;
    const cacheKey = filters ? serializeFilters(filters) : '';

    if (!force) {
      // 1. TTL cache check
      const { _lastFetchTime, _cacheKey, data } = get();
      if (data && _lastFetchTime && Date.now() - _lastFetchTime < CACHE_TTL && _cacheKey === cacheKey) return;

      // 2. In-flight dedup — collapses StrictMode's double-invoke into one request
      if (_inflight && _inflightKey === cacheKey) return _inflight;
    }

    const promise = (async () => {
      try {
        const response = await apiClient.get('/endpoint', { params: buildParams(filters) });
        set({ data: response.data, _lastFetchTime: Date.now(), _cacheKey: cacheKey, error: null });
      } catch (err: any) {
        set({ error: err.message });
      } finally {
        _inflight = null;
        _inflightKey = null;
      }
    })();

    _inflight = promise;
    _inflightKey = cacheKey;
    return promise;
  },
}));
```

**Why correct:**
- React StrictMode (development) fires `useEffect` twice: first invoke sets `_inflight`, second invoke returns the same promise — **one network request**.
- `force = true` bypasses dedup for explicit user-triggered refreshes.
- Module-level (not store state) keeps it out of Zustand's reactivity graph — no spurious re-renders.
- `_inflightKey` scopes dedup to requests with the same cache key, so filter changes always get a fresh request even if one is in-flight.

**Prefer signal threading** (`fetchData({ signal })` → `apiClient.get(..., { signal })`) when the HTTP client supports it — that's the canonical React pattern. Use in-flight dedup when adding signal support would require changing too many layers.

---

## ✅ Quick Validation Checklist

### Store Setup

- [ ] Interfaces defined (`DataState` & `DataActions`)
- [ ] Cache metadata (`_dataFamilyId`, `_lastFetchTime`)
- [ ] `isCacheValid()` method implemented
- [ ] `fetch()` checks cache before request
- [ ] Selectors exported: `export const selectData = ...`
- [ ] NO `isLoading` in data stores (use local state)

### Custom Hooks

- [ ] Selective subscriptions: `useStore(selectData)`
- [ ] NO full store: `const store = useStore()`
- [ ] Return object memoized with `useMemo()`
- [ ] All dependencies included
- [ ] NO hooks inside useMemo/useCallback/useEffect

### Components

- [ ] Each subscription on separate line
- [ ] Actions extracted separately
- [ ] useEffect depends only on primitives
- [ ] NO store objects in dependencies
- [ ] Async effects have AbortController cleanup
- [ ] Signal is threaded through to the HTTP call — OR store uses in-flight dedup (never just "abort guards setState")

### Performance

- [ ] Cache checked before fetch
- [ ] `force: true` only for signal updates
- [ ] Local loading state (not in store)
- [ ] DevTools middleware enabled in dev
- [ ] Store action deduplicates concurrent calls with same cache key (React StrictMode fires effects twice in dev)

## 🎯 When to Use This Skill

### Auto-Activates When:

- Working with files in `src/stores/**/*.ts`
- Working with files in `src/hooks/**/*.ts`
- Keywords: "infinite loop", "maximum update depth", "re-render", "zustand"

### Common Scenarios:

- Creating new Zustand stores
- Adding custom hooks that use stores
- Fixing "Maximum update depth exceeded"
- Fixing "Too many re-renders"
- Debugging redundant API calls
- Implementing cache validation

## 📚 Supporting Documentation

For deep dives into specific topics, reference these files:

- **[anti-patterns.md](./anti-patterns.md)** - Detailed explanations of all anti-patterns with migration paths
- **[correct-patterns.md](./correct-patterns.md)** - Complete implementations with line-by-line explanations
- **[troubleshooting.md](./troubleshooting.md)** - Error diagnosis and step-by-step solutions
- **[store-architecture.md](./store-architecture.md)** - Store design patterns and middleware integration

### Example Templates (Copy-Paste Ready):

- **[examples/data-store.ts](./examples/data-store.ts)** - Complete data store template based on TasksStore
- **[examples/infrastructure-store.ts](./examples/infrastructure-store.ts)** - Auth/Family store patterns
- **[examples/custom-hook.ts](./examples/custom-hook.ts)** - Three hook patterns (simple, complex, with actions)
- **[examples/component-usage.tsx](./examples/component-usage.tsx)** - Page-level component integration
- **[examples/useStoreData-pattern.ts](./examples/useStoreData-pattern.ts)** - Centralized fetch hook pattern
- **[examples/store-factory.ts](./examples/store-factory.ts)** - Cache slice factory (DRY)

### Validation Checklists:

- **[checklists/store-setup.md](./checklists/store-setup.md)** - Store creation checklist
- **[checklists/hook-creation.md](./checklists/hook-creation.md)** - Custom hook checklist
- **[checklists/component-integration.md](./checklists/component-integration.md)** - Component usage checklist
- **[checklists/debugging.md](./checklists/debugging.md)** - Debugging guide with DevTools

## 🎓 Key Takeaways

### Never Do:

- ❌ Subscribe to entire store: `const store = useStore()`
- ❌ Put useCallback in useEffect dependencies
- ❌ Skip cache validation before fetch
- ❌ Call hooks inside hooks
- ❌ Put objects/functions in useEffect deps
- ❌ Create `AbortController` in a component but never pass `signal` to the store action or HTTP call — the abort is a no-op for the network request

### Always Do:

- ✅ Use selective subscriptions: `useStore(selectData)`
- ✅ Check cache before fetching
- ✅ Only primitives in useEffect deps
- ✅ Use AbortController for cleanup AND verify signal reaches the HTTP layer
- ✅ Memoize returned objects
- ✅ Export selectors from store files
- ✅ Use store factories to eliminate boilerplate
- ✅ Deduplicate concurrent store fetches with a module-level in-flight promise when signal threading isn't feasible (React StrictMode fires effects twice in dev)

---

**Version:** 1.0
**Source:** docs/ZUSTAND_IA_AGENT_RULES.md
**Last Updated:** 2026-01-12
