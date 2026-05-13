# Store Architecture Patterns

This document outlines the different types of Zustand stores and their proper structure.

---

## Store Types Overview

### 1. Data Stores

Stores that fetch and cache domain data from APIs (Tasks, Categories, Rewards, etc.)

### 2. Infrastructure Stores

Stores that manage application state and subscriptions (Auth, Family, Notifications)

---

## Data Store Pattern

### Structure

```typescript
interface DataState {
  data: T[]; // Main data array
  error: string | null; // Error state
  _dataFamilyId: string | null; // Cache tracking
  _lastFetchTime: number | null; // Timestamp
}

interface DataActions {
  fetch: (
    familyId: string,
    service: IService,
    options?: {
      force?: boolean;
      signal?: AbortSignal;
    }
  ) => Promise<void>;
  isCacheValid: (familyId: string) => boolean;
  reset: () => void;
}
```

### Characteristics

- ❌ **NO `isLoading`** - Handle loading state in hooks/components
- ✅ **Cache metadata** - `_dataFamilyId` and `_lastFetchTime`
- ✅ **`isCacheValid()` method** - Centralized cache validation
- ✅ **`fetch()` with cache check** - Prevents redundant API calls
- ✅ **`reset()` method** - Cleanup on logout
- ✅ **Exported selectors** - `export const selectData = ...`

### Why NO `isLoading` in Data Stores?

**Problem:**

```typescript
// ❌ BAD - isLoading in store
interface TasksState {
  tasks: Task[];
  isLoading: boolean; // WRONG for data stores
}

// Problem: Multiple components loading same store
<PageA />  // Sets isLoading = true
<PageB />  // Sees isLoading = true (but didn't trigger fetch)
```

**Solution:**

```typescript
// ✅ GOOD - Local loading state
function useStoreData(storeTypes: StoreType[]) {
  const [loadingStores, setLoadingStores] = useState<Set<StoreType>>(new Set());

  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStores(new Set(['tasks']));
      await fetchTasks();
      setLoadingStores(new Set()); // Clear after fetch
    };
    fetchStores();
  }, []);

  return { isLoading: loadingStores.size > 0 };
}
```

### Complete Data Store Example

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

// ============================================
// Types
// ============================================

interface Task {
  id: string;
  title: string;
  completed: boolean;
  childId: string;
}

interface TasksState {
  tasks: Task[];
  error: string | null;
  _dataFamilyId: string | null;
  _lastFetchTime: number | null;
}

interface TasksActions {
  fetch: (
    familyId: string,
    service: ITaskService,
    options?: {
      force?: boolean;
      signal?: AbortSignal;
    }
  ) => Promise<void>;
  isCacheValid: (familyId: string) => boolean;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  reset: () => void;
}

// ============================================
// Selectors (Performance Optimization)
// ============================================

export const selectTasks = (state: TasksState) => state.tasks;
export const selectTasksError = (state: TasksState) => state.error;
export const selectTaskById = (id: string) => (state: TasksState) =>
  state.tasks.find((t) => t.id === id);
export const selectIncompleteTasks = (state: TasksState) => state.tasks.filter((t) => !t.completed);

// ============================================
// Store Creation
// ============================================

export const useTasksStore = create<TasksState & TasksActions>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      tasks: [],
      error: null,
      _dataFamilyId: null,
      _lastFetchTime: null,

      // Cache validation
      isCacheValid: (familyId: string) => {
        const { _dataFamilyId, _lastFetchTime } = get();
        if (_dataFamilyId !== familyId) return false;
        if (!_lastFetchTime) return false;
        return true;
      },

      // Fetch with cache check
      fetch: async (familyId, service, options = {}) => {
        const { force = false, signal } = options;

        // Check cache first
        if (!force && get().isCacheValid(familyId)) {
          console.debug('[TasksStore] Valid cache, skipping fetch');
          return;
        }

        try {
          const tasks = await service.getTasks(familyId, { signal });

          set((state) => {
            state.tasks = tasks;
            state._dataFamilyId = familyId;
            state._lastFetchTime = Date.now();
            state.error = null;
          });

          console.debug('[TasksStore] Fetch success:', tasks.length, 'tasks');
        } catch (err) {
          if (err.name === 'AbortError') return;

          console.error('[TasksStore] Fetch error:', err);
          set((state) => {
            state.error = err instanceof Error ? err.message : 'Error loading tasks';
          });
          throw err;
        }
      },

      // Optimistic updates
      updateTask: (taskId, updates) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (task) {
            Object.assign(task, updates);
          }
        });
      },

      deleteTask: (taskId) => {
        set((state) => {
          state.tasks = state.tasks.filter((t) => t.id !== taskId);
        });
      },

      // Reset on logout
      reset: () => {
        set((state) => {
          state.tasks = [];
          state.error = null;
          state._dataFamilyId = null;
          state._lastFetchTime = null;
        });
      },
    })),
    {
      name: 'TasksStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================
// Convenience Hook (Optional)
// ============================================

export const useTasks = () => {
  const tasks = useTasksStore(selectTasks);
  const error = useTasksStore(selectTasksError);

  return useMemo(
    () => ({
      tasks,
      error,
    }),
    [tasks, error]
  );
};
```

---

## Infrastructure Store Pattern

### Structure

```typescript
interface InfrastructureState {
  // Lifecycle state
  isLoading: boolean; // ✅ ALLOWED here

  // Main data
  currentUser: User | null;

  // Cache/subscription tracking
  _dataFamilyId: string | null;
  _subscribedUserId: string | null;
}
```

### Characteristics

- ✅ **`isLoading` allowed** - Tracks lifecycle, not fetch operations
- ✅ **Cache metadata** - For subscription tracking
- ✅ **Different pattern** - Not REST API stores
- ✅ **Subscription management** - Real-time listeners

### Auth Store Example

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  currentUser: User | null;
  isLoading: boolean; // ✅ Lifecycle loading
  isAuthenticated: boolean;
  _subscribedUserId: string | null;
}

interface AuthActions {
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  subscribeToUser: (userId: string) => () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  immer((set, get) => ({
    currentUser: null,
    isLoading: true, // ✅ Start with loading
    isAuthenticated: false,
    _subscribedUserId: null,

    initialize: async () => {
      set((state) => {
        state.isLoading = true;
      });

      const user = await auth.getCurrentUser();

      set((state) => {
        state.currentUser = user;
        state.isAuthenticated = !!user;
        state.isLoading = false;
      });
    },

    login: async (email, password) => {
      set((state) => {
        state.isLoading = true;
      });

      const user = await auth.signIn(email, password);

      set((state) => {
        state.currentUser = user;
        state.isAuthenticated = true;
        state.isLoading = false;
      });
    },

    logout: async () => {
      await auth.signOut();

      set((state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state._subscribedUserId = null;
      });
    },

    subscribeToUser: (userId) => {
      // Prevent duplicate subscriptions
      if (get()._subscribedUserId === userId) {
        return () => {}; // No-op cleanup
      }

      const unsubscribe = firestore
        .collection('users')
        .doc(userId)
        .onSnapshot((doc) => {
          set((state) => {
            state.currentUser = doc.data() as User;
          });
        });

      set((state) => {
        state._subscribedUserId = userId;
      });

      return unsubscribe;
    },
  }))
);

// Selectors
export const selectCurrentUser = (state: AuthState) => state.currentUser;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
```

---

## Middleware Integration

### Recommended Middleware Stack

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ✅ Order matters: devtools → immer
export const useStore = create<State & Actions>()(
  devtools(
    immer((set, get) => ({
      // ... store implementation
    })),
    {
      name: 'StoreName',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
```

### Why This Order?

1. **devtools** - Outermost, sees all state changes
2. **immer** - Innermost, provides draft state for updates

### Middleware Options

**devtools:**

- `name`: Display name in Redux DevTools
- `enabled`: Only enable in development
- `anonymousActionType`: Default action name

**immer:**

- No options needed
- Automatically handles immutable updates
- Use draft state mutations: `state.tasks.push(task)`

---

## Selector Patterns

### Simple Selector

```typescript
export const selectTasks = (state: TasksState) => state.tasks;

// Usage
const tasks = useTasksStore(selectTasks);
```

### Parameterized Selector (Factory Pattern)

```typescript
export const selectTaskById = (id: string) => (state: TasksState) =>
  state.tasks.find((t) => t.id === id);

// Usage
const task = useTasksStore(selectTaskById('task-123'));
```

### Computed Selector

```typescript
export const selectIncompleteTasks = (state: TasksState) => state.tasks.filter((t) => !t.completed);

export const selectTasksByChild = (childId: string) => (state: TasksState) =>
  state.tasks.filter((t) => t.childId === childId);

// Usage
const incompleteTasks = useTasksStore(selectIncompleteTasks);
const childTasks = useTasksStore(selectTasksByChild('child-123'));
```

### Multiple Selectors with useShallow

```typescript
import { useShallow } from 'zustand/react/shallow';

const { tasks, error } = useTasksStore(
  useShallow((state) => ({
    tasks: state.tasks,
    error: state.error,
  }))
);
```

---

## Store Factories (DRY Pattern)

### Problem: Boilerplate Code

Every data store needs:

- Cache metadata
- `isCacheValid()` method
- `fetch()` with cache check
- Error handling

**Without factories**: 60% code duplication across stores.

### Solution: createCacheSlice Factory

```typescript
// factories/createCacheSlice.ts
import { StateCreator } from 'zustand';

export interface CacheSlice {
  _dataKey: string | null;
  _lastFetchTime: number | null;
  error: string | null;

  isCacheValid: (key: string, ttl?: number) => boolean;
  setCacheSuccess: (key: string) => void;
  setCacheError: (error: any) => void;
  resetCache: () => void;
}

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

  resetCache: () =>
    set({
      _dataKey: null,
      _lastFetchTime: null,
      error: null,
    }),
});
```

### Usage in Stores

```typescript
// stores/tasksStore.ts
export const useTasksStore = create<TasksState & CacheSlice & TasksActions>()(
  immer((...args) => ({
    ...createCacheSlice(...args), // ✅ Inject cache logic

    tasks: [],

    fetch: async (familyId, service, { force, signal } = {}) => {
      const [set, get] = args;
      const state = get();

      if (!force && state.isCacheValid(familyId)) return;

      try {
        const tasks = await service.getTasks(familyId, { signal });
        set((s) => {
          s.tasks = tasks;
        });
        state.setCacheSuccess(familyId);
      } catch (err) {
        if (err.name === 'AbortError') return;
        state.setCacheError(err);
        throw err;
      }
    },
  }))
);
```

**Benefits:**

- ✅ 60% less code
- ✅ Single source of truth
- ✅ Consistent behavior
- ✅ Easy to update all stores

---

## Real-World Store Examples

### From This Codebase

**Data Stores:**

- `tasksStore` - Weekly task completions
- `categoriesStore` - Task categories
- `rewardsStore` - Reward tracking
- `punishmentsStore` - Punishment records

**Infrastructure Stores:**

- `authStore` - Authentication state
- `familyStore` - Family and children data
- `notificationStore` - Notifications
- `uiStore` - UI state (tabs, filters, collapsed states)

---

## Migration Guide

### From Local State to Zustand

**Before (useState):**

```typescript
function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
      setLoading(false);
    };
    load();
  }, []);

  return <TaskList tasks={tasks} loading={loading} />;
}
```

**After (Zustand):**

```typescript
// Store
export const useTasksStore = create<TasksState & TasksActions>()(
  immer((set, get) => ({
    tasks: [],
    _dataFamilyId: null,
    _lastFetchTime: null,

    isCacheValid: (familyId) => { /* ... */ },
    fetch: async (familyId, service) => { /* ... */ },
  }))
);

// Component
function TasksPage() {
  const { isLoading } = useStoreData(['tasks']);
  const tasks = useTasksStore(selectTasks);

  return <TaskList tasks={tasks} loading={isLoading} />;
}
```

**Benefits:**

- ✅ Cache prevents redundant fetches
- ✅ State shared across components
- ✅ Better performance (selective subscriptions)
- ✅ Easier testing (mock store)

---

## Best Practices Summary

### Data Stores

- ✅ Cache metadata required
- ✅ No `isLoading` (use local state)
- ✅ Check cache before fetch
- ✅ Export selectors
- ✅ Use store factories

### Infrastructure Stores

- ✅ `isLoading` allowed
- ✅ Subscription tracking
- ✅ Lifecycle management
- ✅ Real-time listeners

### All Stores

- ✅ immer middleware
- ✅ devtools (dev only)
- ✅ TypeScript interfaces
- ✅ reset() method
- ✅ Error handling

---

**Related:**

- [examples/data-store.ts](./examples/data-store.ts) - Complete data store template
- [examples/infrastructure-store.ts](./examples/infrastructure-store.ts) - Auth/Family store pattern
- [examples/store-factory.ts](./examples/store-factory.ts) - Cache slice factory
