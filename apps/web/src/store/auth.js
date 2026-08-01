import { create } from 'zustand';
export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
    setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: async () => {
        try {
            // Dispatch server-side logout request to clear httpOnly cookies
            await fetch('/api/v1/auth/logout', { method: 'POST' });
        }
        catch {
            // Fail silently, clear client state regardless
        }
        set({ user: null, isAuthenticated: false });
    },
}));
//# sourceMappingURL=auth.js.map