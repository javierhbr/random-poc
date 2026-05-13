/**
 * Component Integration Examples
 *
 * Shows correct patterns for using Zustand stores in React components.
 */

import React, { useMemo, useCallback } from 'react';

// ============================================
// Pattern: Page-Level Component
// ============================================

function TasksPage() {
  // 1. Load necessary data with useStoreData
  const { isLoading } = useStoreData(['tasks', 'categories']);

  // 2. Selective subscriptions (each on separate line)
  const tasks = useTasksStore(selectTasks);
  const categories = useCategoriesStore(selectCategories);

  // 3. Family subscriptions
  const familyId = useFamilyStore(selectFamilyId);
  const familyChildren = useFamilyStore(selectFamilyChildren);

  // 4. Memoized computed data
  const incompleteTasks = useMemo(
    () => tasks.filter((t) => !t.completed && !t.archivedAt),
    [tasks]
  );

  const tasksByCategory = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const categoryTasks = grouped.get(task.categoryId) || [];
      categoryTasks.push(task);
      grouped.set(task.categoryId, categoryTasks);
    });
    return grouped;
  }, [tasks]);

  // 5. Stable event handlers
  const handleRefresh = useCallback(() => {
    const fetch = useTasksStore.getState().fetch;
    fetch(familyId, dataService, { force: true });
  }, [familyId]);

  const handleTaskToggle = useCallback((taskId: string) => {
    const updateTask = useTasksStore.getState().updateTask;
    updateTask(taskId, { completed: true });
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div className="tasks-page">
      <header>
        <h1>Tasks for {familyChildren.length} children</h1>
        <button onClick={handleRefresh}>Refresh</button>
      </header>

      <main>
        <TaskSummary tasks={incompleteTasks} />

        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            tasks={tasksByCategory.get(category.id) || []}
            onTaskToggle={handleTaskToggle}
          />
        ))}
      </main>
    </div>
  );
}

// ============================================
// Pattern: Child Component with Actions
// ============================================

interface TaskItemProps {
  taskId: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ taskId }) => {
  // Data (causes re-render when changed)
  const task = useTasksStore(selectTaskById(taskId));

  // Actions (stable references, no re-render)
  const updateTask = useTasksStore((state) => state.updateTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);

  if (!task) return null;

  return (
    <div className="task-item">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => updateTask(taskId, { completed: e.target.checked })}
      />
      <span>{task.title}</span>
      <button onClick={() => deleteTask(taskId)}>Delete</button>
    </div>
  );
};

export { TasksPage, TaskItem };
