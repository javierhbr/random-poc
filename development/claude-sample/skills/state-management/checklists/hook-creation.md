# Custom Hook Creation Checklist

Use this checklist when creating custom hooks that use Zustand stores.

## 1. Structure Order

- [ ] All store subscriptions FIRST (at top level)
- [ ] Other hooks SECOND (useMemo, useCallback, etc.)
- [ ] Return statement LAST

## 2. Store Subscriptions

- [ ] Uses exported selectors: `useStore(selectData)`
- [ ] NO full store: `const store = useStore()`
- [ ] NO destructuring: `const { a, b, c } = useStore()`
- [ ] Each subscription on separate line
- [ ] Actions extracted separately:
  ```typescript
  const action = useStore((state) => state.action);
  ```

## 3. Memoization

- [ ] Return object wrapped in `useMemo()`
- [ ] All values included in dependency array
- [ ] Getter functions use `useCallback()`
- [ ] Computed values use `useMemo()`

## 4. Rules of Hooks

- [ ] NO hooks inside `useMemo()`
- [ ] NO hooks inside `useCallback()`
- [ ] NO hooks inside `useEffect()`
- [ ] All hooks called at top level
- [ ] Hook order consistent across renders

## 5. Dependencies

- [ ] `useEffect` depends only on primitives (strings, numbers, booleans)
- [ ] NO store objects in dependencies
- [ ] NO useCallback functions in dependencies (use primitives instead)
- [ ] Use `eslint-disable react-hooks/exhaustive-deps` with justification if needed

## 6. Type Safety

- [ ] Return type explicitly defined or inferred
- [ ] All parameters properly typed
- [ ] No `any` types unless absolutely necessary
- [ ] Generic types used where appropriate

## Example Patterns

### Pattern 1: Simple Data Hook

```typescript
export const useTasksData = () => {
  const tasks = useTasksStore(selectTasks);
  const error = useTasksStore(selectTasksError);

  return useMemo(() => ({ tasks, error }), [tasks, error]);
};
```

### Pattern 2: Hook with Getters

```typescript
export const useTasks = () => {
  const tasks = useTasksStore(selectTasks);

  const getTaskById = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]);

  return useMemo(
    () => ({
      tasks,
      getTaskById,
    }),
    [tasks, getTaskById]
  );
};
```

### Pattern 3: Hook with Actions

```typescript
export const useTaskOperations = () => {
  const tasks = useTasksStore(selectTasks);
  const updateTask = useTasksStore((state) => state.updateTask);

  const toggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task) updateTask(id, { completed: !task.completed });
    },
    [tasks, updateTask]
  );

  return useMemo(
    () => ({
      tasks,
      updateTask,
      toggleTask,
    }),
    [tasks, updateTask, toggleTask]
  );
};
```
