/**
 * Infrastructure Store Template
 *
 * Example of Auth store pattern with lifecycle management and subscriptions.
 * Unlike data stores, infrastructure stores CAN have `isLoading` for lifecycle tracking.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  currentUser: User | null;
  isLoading: boolean; // ✅ Allowed in infrastructure stores
  isAuthenticated: boolean;
  _subscribedUserId: string | null; // Track subscription
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
    isLoading: true, // Start with loading
    isAuthenticated: false,
    _subscribedUserId: null,

    initialize: async () => {
      set((state) => {
        state.isLoading = true;
      });
      // Check auth state
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
        return () => {};
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

export const selectCurrentUser = (state: AuthState) => state.currentUser;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
