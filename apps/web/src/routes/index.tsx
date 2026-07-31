import { Routes, Route } from 'react-router-dom';

/**
 * Application routing — routes will be populated in Phase 6.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex min-h-screen items-center justify-center bg-surface-950 text-surface-100">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-brand-400">
                NUVRO API Studio
              </h1>
              <p className="mt-3 text-surface-300">Phase 0 scaffold complete — routes coming soon.</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
