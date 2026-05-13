# Debugging Checklist

Step-by-step guide for debugging Zustand state management issues.

## 1. Identify the Problem

- [ ] "Maximum update depth exceeded" → Infinite re-render loop
- [ ] "Too many re-renders" → setState in render
- [ ] "Rendered more hooks" → Hooks inside hooks
- [ ] "Can't perform state update" → Missing cleanup
- [ ] Duplicate API calls → Missing cache validation
- [ ] Excessive re-renders → Full store subscription

## 2. React DevTools Profiler

1. [ ] Open React DevTools
2. [ ] Go to Profiler tab
3. [ ] Click Record
4. [ ] Perform action causing issue
5. [ ] Stop recording
6. [ ] Find component with many renders
7. [ ] Click "Why did this render?"
8. [ ] Check "Props" and "State" changes

## 3. Network Tab Inspection

1. [ ] Open DevTools → Network
2. [ ] Filter by Fetch/XHR
3. [ ] Look for duplicate requests
4. [ ] Check timing (milliseconds apart = loop)
5. [ ] Check request payload (identical = cache miss)

## 4. Console Logging Strategy

### In Store

```typescript
fetch: async (familyId, service) => {
  console.debug('[Store] Fetch called:', familyId);
  console.debug('[Store] Cache valid?', get().isCacheValid(familyId));
  console.debug('[Store] Last fetch:', new Date(get()._lastFetchTime || 0));
  // ... fetch logic
};
```

### In Component

```typescript
function Component() {
  console.log('Component rendering');
  useEffect(() => {
    console.log('Effect running');
  }, [deps]);
}
```

### In Hook

```typescript
export const useCustom = () => {
  const data = useStore(selectData);
  console.log('Hook called, data:', data);
  return useMemo(() => {
    console.log('useMemo executing');
    return { data };
  }, [data]);
};
```

## 5. Redux DevTools

If using `devtools` middleware:

1. [ ] Open Redux tab in DevTools
2. [ ] See all state changes in real-time
3. [ ] Use time-travel to go back before error
4. [ ] Identify which action caused issue
5. [ ] Export state for testing

## 6. Breakpoint Strategy

Set breakpoints in:

- [ ] Store `fetch()` method
- [ ] Store `isCacheValid()` method
- [ ] useEffect hooks
- [ ] Custom hooks
- [ ] Event handlers

Check:

- [ ] Call stack (where called from)
- [ ] Variable values
- [ ] Execution frequency

## 7. Quick Fixes

### Maximum Update Depth

- [ ] Replace full store subscriptions: `const data = useStore(selectData)`
- [ ] Memoize return objects: `return useMemo(() => ({ data }), [data])`
- [ ] Only primitives in useEffect deps

### Duplicate API Calls

- [ ] Check `_dataFamilyId` and `_lastFetchTime` exist
- [ ] Verify `isCacheValid()` returns true
- [ ] Confirm `fetch()` checks cache first

### Memory Leaks

- [ ] Add `AbortController` cleanup to async effects
- [ ] Return cleanup function from useEffect
- [ ] Handle `AbortError` separately

## 8. Prevention

- [ ] Code review checklist before commit
- [ ] Test component mount/unmount cycles
- [ ] Check Network tab during development
- [ ] Use React.StrictMode (double-renders in dev)
- [ ] Monitor console for warnings
