# Store Creation Checklist

Use this checklist when creating a new Zustand store.

## 1. Interfaces

- [ ] `interface DataState` defined with all required fields
- [ ] `interface DataActions` defined with all methods
- [ ] Proper TypeScript types for all fields and parameters
- [ ] JSDoc comments for complex types

## 2. Cache Metadata (Data Stores Only)

- [ ] `_dataFamilyId: string | null` (or `_dataKey` for generic stores)
- [ ] `_lastFetchTime: number | null`
- [ ] `error: string | null`
- [ ] NO `isLoading` in data stores (use local state in hooks)

## 3. Required Methods

### isCacheValid()

- [ ] Checks if `_dataFamilyId` matches parameter
- [ ] Checks if `_lastFetchTime` exists
- [ ] Returns boolean
- [ ] Documented with JSDoc

### fetch()

- [ ] Accepts `familyId`, `service`, and optional `options`
- [ ] Calls `isCacheValid()` first (unless `force: true`)
- [ ] Returns early if cache valid
- [ ] Accepts optional `AbortSignal` in options
- [ ] Updates cache metadata on success
- [ ] Handles `AbortError` gracefully
- [ ] Sets error state on failure
- [ ] Logs debug messages (dev only)

### reset()

- [ ] Clears all data
- [ ] Resets cache metadata to null
- [ ] Clears error state
- [ ] Called on logout

## 4. Selectors

- [ ] At least one selector per main field
- [ ] Exported from store file: `export const selectData = ...`
- [ ] Named consistently: `selectXXX`
- [ ] Parameterized selectors use factory pattern:
  ```typescript
  export const selectById = (id: string) => (state: State) => state.items.find((i) => i.id === id);
  ```

## 5. Middleware

- [ ] `immer` middleware for immutable updates
- [ ] `devtools` middleware for debugging
- [ ] Correct middleware order: `devtools(immer(...))`
- [ ] DevTools only enabled in development:
  ```typescript
  {
    name: 'StoreName',
    enabled: process.env.NODE_ENV === 'development'
  }
  ```

## 6. Best Practices

- [ ] NO `isLoading` in data stores (use local state)
- [ ] Actions accept service as parameter (dependency injection)
- [ ] Cache checked before every fetch
- [ ] Debug logs use `console.debug()` (not `console.log`)
- [ ] Error handling with try/catch
- [ ] `AbortError` handled separately from real errors

## 7. Optional Convenience Hook

If creating a convenience hook:

- [ ] Uses selective subscriptions: `useStore(selectData)`
- [ ] Returns memoized object with `useMemo()`
- [ ] All dependencies included in dependency array
- [ ] Provides common operations (not just data access)

## Example Minimal Store

```typescript
export const useTasksStore = create<TasksState & TasksActions>()(
  devtools(
    immer((set, get) => ({
      // State
      tasks: [],
      error: null,
      _dataFamilyId: null,
      _lastFetchTime: null,

      // Methods
      isCacheValid: (familyId) => {
        const { _dataFamilyId, _lastFetchTime } = get();
        return _dataFamilyId === familyId && !!_lastFetchTime;
      },

      fetch: async (familyId, service, options = {}) => {
        if (!options.force && get().isCacheValid(familyId)) return;
        const data = await service.getData(familyId, { signal: options.signal });
        set((state) => {
          state.tasks = data;
          state._dataFamilyId = familyId;
          state._lastFetchTime = Date.now();
        });
      },

      reset: () => set({ tasks: [], error: null, _dataFamilyId: null, _lastFetchTime: null }),
    })),
    { name: 'TasksStore', enabled: process.env.NODE_ENV === 'development' }
  )
);

export const selectTasks = (state: TasksState) => state.tasks;
```
