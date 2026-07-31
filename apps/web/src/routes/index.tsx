import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute.js';
import { LoginPage } from '../pages/login.js';
import { RegisterPage } from '../pages/register.js';
import { useAuthStore } from '../store/auth.js';

export function AppRoutes() {
  const { user, logout } = useAuthStore();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Root App Route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="flex min-h-screen items-center justify-center bg-surface-950 text-surface-100">
              <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold tracking-tight text-brand-400">
                  NUVRO API Studio
                </h1>
                <p className="text-surface-300">
                  Logged in as <span className="font-semibold text-surface-100">{user?.username}</span>
                </p>
                <div>
                  <button
                    onClick={() => logout()}
                    className="rounded-lg bg-surface-800 hover:bg-surface-700 px-4 py-2 text-sm font-semibold transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
