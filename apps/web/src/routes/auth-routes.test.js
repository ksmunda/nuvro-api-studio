import { describe, it, expect } from 'vitest';
import { useAuthStore } from '../store/auth.js';
describe('React Web App Auth State Store', () => {
    it('initializes with default loading states', () => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isLoading).toBe(true);
    });
    it('updates state when user profile is loaded', () => {
        const mockUser = { id: 'u1', email: 'dev@nuvro.dev', username: 'dev' };
        useAuthStore.getState().setUser(mockUser);
        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.isAuthenticated).toBe(true);
    });
    it('clears state on logout', () => {
        useAuthStore.getState().setUser(null);
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });
});
//# sourceMappingURL=auth-routes.test.js.map