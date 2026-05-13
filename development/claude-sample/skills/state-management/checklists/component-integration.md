# Component Integration Checklist

Use this checklist when integrating Zustand stores into React components.

## 1. Subscriptions

- [ ] Each subscription on separate line
- [ ] Uses exported selectors: `useStore(selectData)`
- [ ] NO full store: `const store = useStore()`
- [ ] Actions extracted separately
- [ ] Only subscribe to data actually used

## 2. useEffect Dependencies

- [ ] Depends only on primitives (strings, numbers, booleans)
- [ ] NO store objects in dependencies
- [ ] NO functions in dependencies (unless stable from store)
- [ ] Minimal dependencies (only what triggers effect)

## 3. Async Effects

- [ ] Has cleanup function with `AbortController`
- [ ] Handles `AbortError` separately
- [ ] Doesn't call setState after unmount

### Example

```typescript
useEffect(() => {
  const controller = new AbortController();

  const loadData = async () => {
    try {
      const data = await api.get({ signal: controller.signal });
      setState(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error(err);
    }
  };

  loadData();
  return () => controller.abort();
}, [deps]);
```

## 4. Memoization

- [ ] Computed values use `useMemo()`
- [ ] Event handlers use `useCallback()` when passed to children
- [ ] Objects/arrays memoized to prevent re-renders

## 5. Event Handlers

- [ ] Stable references (not recreated on every render)
- [ ] Use store actions directly when possible
- [ ] Wrap in `useCallback()` if containing local state

### Example

```typescript
const handleRefresh = useCallback(() => {
  const fetch = useTasksStore.getState().fetch;
  fetch(familyId, service, { force: true });
}, [familyId]);
```

## 6. Common Patterns

### Pattern: Page Load

```typescript
function Page() {
  const { isLoading } = useStoreData(['tasks', 'categories']);
  const tasks = useTasksStore(selectTasks);

  if (isLoading) return <Loading />;
  return <TaskList tasks={tasks} />;
}
```

### Pattern: Component with Actions

```typescript
const TaskItem = ({ taskId }) => {
  const task = useTasksStore(selectTaskById(taskId));
  const updateTask = useTasksStore(state => state.updateTask);

  return (
    <div>
      <input
        checked={task?.completed}
        onChange={(e) => updateTask(taskId, { completed: e.target.checked })}
      />
    </div>
  );
};
```
