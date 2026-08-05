import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.js';

import { getApiUrl } from '../../config/api.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, setUser } = useAuthStore();

  useEffect(() => {
    // Try to load user profile on mount to see if session cookie is valid
    if (!isAuthenticated && isLoading) {
      fetch(getApiUrl('/api/v1/auth/me'))
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Not authenticated');
        })
        .then((payload) => {
          if (payload.success && payload.data.user) {
            setUser(payload.data.user);
          } else {
            setUser(null);
          }
        })
        .catch(() => {
          setUser(null);
        })
        .finally(() => {
          useAuthStore.getState().setLoading(false);
        });
    }
  }, [isAuthenticated, isLoading, setUser]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950 text-brand-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
