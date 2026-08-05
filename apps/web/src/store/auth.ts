import { create } from 'zustand';
import { getApiUrl } from '../config/api.js';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    try {
      // Dispatch server-side logout request to clear httpOnly cookies
      await fetch(getApiUrl('/api/v1/auth/logout'), { method: 'POST' });
    } catch {
      // Fail silently, clear client state regardless
    }
    set({ user: null, isAuthenticated: false });
  },
}));
