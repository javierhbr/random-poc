# Troubleshooting Zustand State Management Issues

This guide provides step-by-step solutions for common errors when using Zustand. Each error includes root cause, diagnostic steps, quick fix, and long-term solution.

---

## 🚨 Error: "Maximum update depth exceeded"

### Error Message

```
Error: Maximum update depth exceeded. This can happen when a component
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
React limits the number of nested updates to prevent infinite loops.
```

### Root Cause

Component is stuck in an infinite re-render loop, usually caused by:

1. Subscribing to full store instead of selective values
2. Creating new objects/arrays on every render
3. Store object in useEffect dependencies
4. useCallback function in useEffect dependencies

### Diagnostic Checklist

- [ ] **Check for full store subscriptions**

  ```typescript
  const store = useStore(); // ❌ BAD
  const { data, actions } = useStore(); // ❌ BAD
  ```

- [ ] **Check useEffect dependencies**

  ```typescript
  useEffect(() => { ... }, [store]); // ❌ Object
  useEffect(() => { ... }, [fetchData]); // ❌ Function
  ```

- [ ] **Check custom hooks**

  ```typescript
  export const useData = () => {
    return { data: useStore((s) => s.data) }; // ❌ New object every render
  };
  ```

- [ ] **Add console.log to identify component**
  ```typescript
  console.log('Component rendering:', componentName);
  useEffect(() => {
    console.log('Effect running');
  }, [deps]);
  ```

### Quick Fix

**Step 1**: Replace full store subscriptions

```typescript
// ❌ Before
const store = useStore();

// ✅ After
const data = useStore(selectData);
const error = useStore(selectError);
```

**Step 2**: Memoize return objects

```typescript
// ❌ Before
return { data, actions };

// ✅ After
return useMemo(() => ({ data, actions }), [data, actions]);
```

**Step 3**: Only primitives in useEffect

```typescript
// ❌ Before
useEffect(() => { ... }, [fetchData]);

// ✅ After
useEffect(() => { ... }, [familyId]); // Primitive only
// eslint-disable-next-line react-hooks/exhaustive-deps
```

### Long-Term Solution

1. **Export selectors from store files**

   ```typescript
   export const selectData = (state: State) => state.data;
   ```

2. **Use selective subscriptions everywhere**

   ```typescript
   const data = useStore(selectData);
   ```

3. **Memoize custom hook returns**

   ```typescript
   export const useCustom = () => {
     const data = useStore(selectData);
     return useMemo(() => ({ data }), [data]);
   };
   ```

4. **Extract actions separately**
   ```typescript
   const action = useStore((state) => state.action);
   ```

### Prevention

- ✅ Always use exported selectors
- ✅ Memoize returned objects
- ✅ Only primitives in useEffect deps
- ✅ Code review for full store usage

---

## 🚨 Error: "Too many re-renders"

### Error Message

```
Error: Too many re-renders. React limits the number of renders to prevent
an infinite loop.
```

### Root Cause

Component re-rendering infinitely, usually caused by:

1. setState called directly in render (not in useEffect/handler)
2. New object/array created in render passed as prop
3. Custom hook recreating object on every call

### Diagnostic Checklist

- [ ] **Check for setState in render**

  ```typescript
  const Component = () => {
    setState(value); // ❌ Called in render
    return <div>...</div>;
  };
  ```

- [ ] **Check for inline object creation**

  ```typescript
  <Child config={{ a: 1, b: 2 }} /> // ❌ New object every render
  ```

- [ ] **Check custom hooks**
  ```typescript
  const config = useConfig(); // Returns new object every time?
  ```

### Quick Fix

**Move setState to useEffect:**

```typescript
// ❌ Before
const data = fetchData(); // Called in render

// ✅ After
useEffect(() => {
  fetchData();
}, []);
```

**Memoize objects:**

```typescript
// ❌ Before
const config = { a: 1, b: 2 }; // New object every render

// ✅ After
const config = useMemo(() => ({ a: 1, b: 2 }), []);
```

**Memoize custom hook returns:**

```typescript
// ❌ Before
export const useConfig = () => ({ setting: 'value' });

// ✅ After
export const useConfig = () => useMemo(() => ({ setting: 'value' }), []);
```

### Prevention

- ✅ Never call setState directly in render
- ✅ Memoize objects/arrays with useMemo
- ✅ Memoize custom hook returns
- ✅ Use React.memo for components receiving objects

---

## 🚨 Error: "Rendered more hooks than during the previous render"

### Error Message

```
Error: Rendered more hooks than during the previous render.
```

or

```
Warning: React has detected a change in the order of Hooks called by [Component].
This will lead to bugs and errors if not fixed.
```

### Root Cause

Violates React's Rules of Hooks:

1. Hooks called inside useMemo/useCallback/useEffect
2. Hooks called conditionally
3. Hooks call order changes between renders

### Diagnostic Checklist

- [ ] **Check for hooks inside hooks**

  ```typescript
  useMemo(() => ({
    action: useCallback(() => { ... }, []) // ❌ Hook inside useMemo
  }), []);
  ```

- [ ] **Check for conditional hooks**

  ```typescript
  if (condition) {
    const data = useStore(selectData); // ❌ Conditional hook
  }
  ```

- [ ] **Check hook call order**
  ```typescript
  const a = useHookA();
  if (condition) return null; // Changes hook order below
  const b = useHookB(); // Sometimes called, sometimes not
  ```

### Quick Fix

**Move hooks to top level:**

```typescript
// ❌ Before
export const useCustom = () => {
  return useMemo(() => ({
    action: useCallback(() => { ... }, []) // Hook inside useMemo
  }), []);
};

// ✅ After
export const useCustom = () => {
  // All hooks at top level
  const data = useStore(selectData);
  const action = useCallback(() => { ... }, []);

  // useMemo without hooks inside
  return useMemo(() => ({
    data,
    action,
  }), [data, action]);
};
```

**Unconditional hooks:**

```typescript
// ❌ Before
if (condition) {
  const data = useStore(selectData);
}

// ✅ After
const data = useStore(selectData);
if (condition) {
  // Use data here
}
```

### Prevention

- ✅ All hooks at top level of component/hook
- ✅ No hooks inside useMemo/useCallback/useEffect
- ✅ No conditional hooks
- ✅ Consistent hook call order

---

## 🚨 Error: "Can't perform React state update on unmounted component"

### Error Message

```
Warning: Can't perform a React state update on an unmounted component.
This is a no-op, but it indicates a memory leak in your application.
To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
```

### Root Cause

setState called after component unmounts, usually caused by:

1. Async operation without cleanup
2. Promise without cancellation
3. Timeout/Interval without cleanup

### Diagnostic Checklist

- [ ] **Check async useEffect**

  ```typescript
  useEffect(() => {
    const load = async () => {
      const data = await api.get();
      setState(data); // May run after unmount
    };
    load();
  }, []); // No cleanup
  ```

- [ ] **Check timeouts**
  ```typescript
  useEffect(() => {
    setTimeout(() => setState(value), 1000);
  }, []); // No cleanup
  ```

### Quick Fix

**Use AbortController:**

```typescript
// ✅ Correct
useEffect(() => {
  const controller = new AbortController();

  const loadData = async () => {
    try {
      const data = await api.get({ signal: controller.signal });
      setState(data); // Only if not aborted
    } catch (err) {
      if (err.name === 'AbortError') return; // Normal cancellation
      console.error(err);
    }
  };

  loadData();

  return () => {
    controller.abort(); // Cancels HTTP request
  };
}, [deps]);
```

**Clear timeouts:**

```typescript
// ✅ Correct
useEffect(() => {
  const timeoutId = setTimeout(() => setState(value), 1000);

  return () => {
    clearTimeout(timeoutId);
  };
}, []);
```

### Prevention

- ✅ Always return cleanup function from useEffect
- ✅ Use AbortController for fetch requests
- ✅ Clear timeouts/intervals
- ✅ Test component mount/unmount cycles

---

## 🌐 Problem: Duplicate API Calls

### Symptoms

- Network tab shows identical requests
- Multiple loading states
- Flickering data
- High Firebase read costs

### Diagnostic Steps

**Step 1: Open Network Tab**

- DevTools → Network
- Filter by Fetch/XHR
- Look for duplicate requests
- Check timing (should not be milliseconds apart)

**Step 2: Add Logging**

```typescript
fetch: async (familyId, service) => {
  console.log('[Store] Fetch called for:', familyId);
  console.log('[Store] Cache valid?', get().isCacheValid(familyId));
  console.log('[Store] Last fetch:', new Date(get()._lastFetchTime || 0));

  // ... fetch logic
};
```

**Step 3: Check Store State**

```typescript
// In DevTools console
console.log(useTasksStore.getState());
```

Look for:

- [ ] `_dataFamilyId` matches current familyId?
- [ ] `_lastFetchTime` exists?
- [ ] `isCacheValid()` returns true?

### Root Causes

1. **Missing cache metadata:**

   ```typescript
   // ❌ No cache tracking
   interface State {
     data: T[];
   }
   ```

2. **No cache validation:**

   ```typescript
   // ❌ Always fetches
   fetch: async (familyId, service) => {
     const data = await service.get(familyId);
     set({ data });
   };
   ```

3. **Not calling isCacheValid:**
   ```typescript
   // ❌ Skips cache check
   useEffect(() => {
     fetchData(familyId, service);
   }, [familyId]);
   ```

### Solution

**Implement cache pattern:**

```typescript
interface State {
  data: T[];
  _dataFamilyId: string | null;
  _lastFetchTime: number | null;
}

export const useStore = create((set, get) => ({
  data: [],
  _dataFamilyId: null,
  _lastFetchTime: null,

  isCacheValid: (familyId: string) => {
    const { _dataFamilyId, _lastFetchTime } = get();
    return _dataFamilyId === familyId && !!_lastFetchTime;
  },

  fetch: async (familyId, service, options = {}) => {
    const { force = false } = options;

    // ✅ Check cache
    if (!force && get().isCacheValid(familyId)) {
      console.debug('[Store] Cache hit');
      return;
    }

    const data = await service.get(familyId);
    set({
      data,
      _dataFamilyId: familyId,
      _lastFetchTime: Date.now(),
    });
  },
}));
```

---

## 🐛 Debugging Workflow

### Step 1: Identify Component

Add logging to every render:

```typescript
function Component() {
  console.log('Component rendering');

  useEffect(() => {
    console.log('Effect running');
  }, [deps]);

  return <div>...</div>;
}
```

### Step 2: React DevTools Profiler

1. Open React DevTools
2. Go to Profiler tab
3. Click Record
4. Perform action that causes issue
5. Stop recording
6. Find component with many renders
7. Click component → "Why did this render?"

### Step 3: Network Tab

1. Open DevTools → Network
2. Filter by Fetch/XHR
3. Look for patterns:
   - Duplicate requests (cache issue)
   - Rapid succession (loop issue)
   - After unmount (cleanup issue)

### Step 4: Redux DevTools

If using `devtools` middleware:

1. Open Redux tab in DevTools
2. See all state changes
3. Time-travel to before error
4. Identify which action caused issue

### Step 5: Breakpoints

Set breakpoints in:

- Store `fetch()` method
- useEffect hooks
- Custom hooks
- Event handlers

Check call stack to see where call originated.

---

## 📊 Performance Checklist

Run this checklist when debugging performance issues:

### Store Setup

- [ ] Cache metadata present (`_dataFamilyId`, `_lastFetchTime`)
- [ ] `isCacheValid()` implemented
- [ ] `fetch()` checks cache before request
- [ ] Selectors exported from store
- [ ] DevTools middleware enabled (dev only)

### Custom Hooks

- [ ] Selective subscriptions used
- [ ] Return object memoized
- [ ] No hooks inside hooks
- [ ] Dependencies correct

### Components

- [ ] No full store subscriptions
- [ ] useEffect depends only on primitives
- [ ] Async effects have cleanup
- [ ] Actions extracted separately

### Network

- [ ] No duplicate requests
- [ ] Cache validation working
- [ ] AbortController cleanup working

---

## 🎯 Quick Reference: Error → Solution

| Error                   | Quick Fix                             |
| ----------------------- | ------------------------------------- |
| Maximum update depth    | Use selective subscriptions + memoize |
| Too many re-renders     | Move setState to useEffect            |
| Rendered more hooks     | Move hooks to top level               |
| Memory leak warning     | Add AbortController cleanup           |
| Duplicate API calls     | Implement cache validation            |
| useEffect infinite loop | Only primitives in deps               |

---

**Related:**

- [anti-patterns.md](./anti-patterns.md) - What causes these errors
- [correct-patterns.md](./correct-patterns.md) - Correct implementations
- [checklists/debugging.md](./checklists/debugging.md) - Step-by-step debugging guide
