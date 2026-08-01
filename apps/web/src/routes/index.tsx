import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute.js';
import { LoginPage } from '../pages/login.js';
import { RegisterPage } from '../pages/register.js';
import { StudioPage } from '../pages/StudioPage.js';

export function AppRoutes() {
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
            <StudioPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
