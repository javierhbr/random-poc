/**
 * Data Store Template
 *
 * Complete example of a data store with cache validation, optimistic updates,
 * and proper TypeScript types. Based on the actual TasksStore pattern.
 *
 * Copy this template when creating new data stores for domain entities.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

// ============================================
// Types & Interfaces
// ============================================

/**
 * Domain entity interface
 * Replace Task with your entity type
 */
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  childId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service interface for data operations
 * Your actual service should implement this
 */
interface ITaskService {
  getTasks(familyId: string, options?: { signal?: AbortSignal }): Promise<Task[]>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
}

/**
 * Store state interface
 * Contains data and cache metadata
 */
interface TasksState {
  // Main data
  tasks: Task[];

  // Error state
  error: string | null;

  // Cache tracking metadata
  _dataFamilyId: string | null; // Which family's data is cached
  _lastFetchTime: number | null; // When data was last fetched
}

/**
 * Store actions interface
 * All methods that modify state
 */
interface TasksActions {
  /**
   * Fetch tasks from API with cache validation
   * @param familyId - Family ID to fetch for
   * @param service - Service instance for API calls
   * @param options - Optional force refresh and AbortSignal
   */
  fetch: (
    familyId: string,
    service: ITaskService,
    options?: {
      force?: boolean;
      signal?: AbortSignal;
    }
  ) => Promise<void>;

  /**
   * Check if cached data is valid for given familyId
   * @param familyId - Family ID to check
   * @returns true if cache is valid, false otherwise
   */
  isCacheValid: (familyId: string) => boolean;

  /**
   * Update a task optimistically
   * @param taskId - Task ID to update
   * @param updates - Partial task updates
   */
  updateTask: (taskId: string, updates: Partial<Task>) => void;

  /**
   * Delete a task optimistically
   * @param taskId - Task ID to delete
   */
  deleteTask: (taskId: string) => void;

  /**
   * Reset store to initial state
   * Call on logout or family change
   */
  reset: () => void;
}

// ============================================
// Selectors (Performance Optimization)
// ============================================

/**
 * Export selectors for optimal performance
 * Components using these selectors share memoization
 */

export const selectTasks = (state: TasksState) => state.tasks;
export const selectTasksError = (state: TasksState) => state.error;

/**
 * Parameterized selector using factory pattern
 */
export const selectTaskById = (id: string) => (state: TasksState) =>
  state.tasks.find((t) => t.id === id);

/**
 * Computed selectors for derived state
 */
export const selectIncompleteTasks = (state: TasksState) => state.tasks.filter((t) => !t.completed);

export const selectTasksByChild = (childId: string) => (state: TasksState) =>
  state.tasks.filter((t) => t.childId === childId);

export const selectTasksByCategory = (categoryId: string) => (state: TasksState) =>
  state.tasks.filter((t) => t.categoryId === categoryId);

// ============================================
// Store Creation
// ============================================

/**
 * Main store with devtools and immer middleware
 * Middleware order matters: devtools → immer
 */
export const useTasksStore = create<TasksState & TasksActions>()(
  devtools(
    immer((set, get) => ({
      // ============================================
      // Initial State
      // ============================================

      tasks: [],
      error: null,
      _dataFamilyId: null,
      _lastFetchTime: null,

      // ============================================
      // Cache Validation
      // ============================================

      isCacheValid: (familyId: string) => {
        const { _dataFamilyId, _lastFetchTime } = get();

        // Different family = invalid cache
        if (_dataFamilyId !== familyId) {
          return false;
        }

        // Never fetched = invalid cache
        if (!_lastFetchTime) {
          return false;
        }

        // Cache is valid (no TTL expiration)
        // Data only refreshed on signal updates with force: true
        return true;
      },

      // ============================================
      // Fetch Method (with cache check)
      // ============================================

      fetch: async (familyId, service, options = {}) => {
        const { force = false, signal } = options;

        // IMPORTANT: Check cache before fetching
        if (!force && get().isCacheValid(familyId)) {
          console.debug('[TasksStore] Valid cache, skipping fetch');
          return;
        }

        try {
          // Make API call with optional AbortSignal
          const tasks = await service.getTasks(familyId, { signal });

          // Update state with immer (mutations are OK)
          set((state) => {
            state.tasks = tasks;
            state._dataFamilyId = familyId;
            state._lastFetchTime = Date.now();
            state.error = null;
          });

          console.debug('[TasksStore] Fetch success:', tasks.length, 'tasks');
        } catch (err) {
          // AbortError is normal when component unmounts
          if (err.name === 'AbortError') {
            console.debug('[TasksStore] Fetch cancelled');
            return;
          }

          // Real error - log and set error state
          console.error('[TasksStore] Fetch error:', err);
          set((state) => {
            state.error = err instanceof Error ? err.message : 'Error loading tasks';
          });

          // Re-throw so caller can handle
          throw err;
        }
      },

      // ============================================
      // Optimistic Updates
      // ============================================

      /**
       * Update task immediately in local state
       * Caller should handle persistence and revert on failure
       */
      updateTask: (taskId, updates) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (task) {
            Object.assign(task, updates);
            task.updatedAt = new Date().toISOString();
          }
        });
      },

      /**
       * Delete task immediately from local state
       * Caller should handle persistence and revert on failure
       */
      deleteTask: (taskId) => {
        set((state) => {
          state.tasks = state.tasks.filter((t) => t.id !== taskId);
        });
      },

      // ============================================
      // Reset (Logout/Cleanup)
      // ============================================

      reset: () => {
        set((state) => {
          state.tasks = [];
          state.error = null;
          state._dataFamilyId = null;
          state._lastFetchTime = null;
        });
        console.debug('[TasksStore] Reset complete');
      },
    })),
    {
      // DevTools configuration
      name: 'TasksStore', // Display name in Redux DevTools
      enabled: process.env.NODE_ENV === 'development', // Only in dev
    }
  )
);

// ============================================
// Convenience Hook (Optional)
// ============================================

import { useMemo } from 'react';

/**
 * Convenience hook for common data access patterns
 * Returns memoized object to prevent unnecessary re-renders
 */
export const useTasks = () => {
  const tasks = useTasksStore(selectTasks);
  const error = useTasksStore(selectTasksError);

  // Memoize to return stable reference
  return useMemo(
    () => ({
      tasks,
      error,
    }),
    [tasks, error]
  );
};

// ============================================
// Usage Examples
// ============================================

/**
 * Example 1: Load data on mount
 *
 * function TasksPage() {
 *   const { isLoading } = useStoreData(['tasks']);
 *   const tasks = useTasksStore(selectTasks);
 *
 *   if (isLoading) return <Loading />;
 *   return <TaskList tasks={tasks} />;
 * }
 */

/**
 * Example 2: Manual refresh
 *
 * const handleRefresh = () => {
 *   const fetch = useTasksStore.getState().fetch;
 *   const familyId = useFamilyStore.getState().familyId;
 *   fetch(familyId, dataService, { force: true });
 * };
 */

/**
 * Example 3: Optimistic update
 *
 * const handleToggle = async (taskId: string) => {
 *   // Update UI immediately
 *   const updateTask = useTasksStore.getState().updateTask;
 *   updateTask(taskId, { completed: true });
 *
 *   try {
 *     // Persist to backend
 *     await taskService.updateTask(taskId, { completed: true });
 *   } catch (err) {
 *     // Revert on failure
 *     updateTask(taskId, { completed: false });
 *     console.error('Failed to update task:', err);
 *   }
 * };
 */
