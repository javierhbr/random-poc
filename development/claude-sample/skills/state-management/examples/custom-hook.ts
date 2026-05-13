/**
 * Custom Hook Patterns
 *
 * Three patterns for creating custom hooks that use Zustand stores.
 */

import { useMemo, useCallback } from 'react';

// ============================================
// Pattern 1: Simple Data Hook
// ============================================

export const useTasksData = () => {
  const tasks = useTasksStore(selectTasks);
  const error = useTasksStore(selectTasksError);

  // ✅ Memoize returned object
  return useMemo(
    () => ({
      tasks,
      error,
    }),
    [tasks, error]
  );
};

// ============================================
// Pattern 2: Complex Hook with Getters
// ============================================

export const usePunishments = () => {
  const punishments = usePunishmentsStore(selectPunishments);
  const activePunishments = usePunishmentsStore(selectActivePunishments);

  // ✅ Memoized getter functions with useCallback
  const getActivePunishmentsForDate = useCallback(
    (date: string | Date) => {
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      return activePunishments.filter(
        (p) => p.startDate <= dateStr && (!p.endDate || p.endDate >= dateStr)
      );
    },
    [activePunishments]
  );

  const getPunishmentById = useCallback(
    (id: string) => punishments.find((p) => p.id === id),
    [punishments]
  );

  // ✅ Memoized return object
  return useMemo(
    () => ({
      punishments,
      activePunishments,
      getActivePunishmentsForDate,
      getPunishmentById,
    }),
    [punishments, activePunishments, getActivePunishmentsForDate, getPunishmentById]
  );
};

// ============================================
// Pattern 3: Hook with Actions
// ============================================

export const useTaskOperations = () => {
  // Data subscriptions
  const tasks = useTasksStore(selectTasks);
  const error = useTasksStore(selectTasksError);

  // Actions (stable references)
  const updateTask = useTasksStore((state) => state.updateTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);

  // Custom operations
  const toggleTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        updateTask(taskId, { completed: !task.completed });
      }
    },
    [tasks, updateTask]
  );

  return useMemo(
    () => ({
      tasks,
      error,
      updateTask,
      deleteTask,
      toggleTask,
    }),
    [tasks, error, updateTask, deleteTask, toggleTask]
  );
};
