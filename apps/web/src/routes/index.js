import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute.js';
import { LoginPage } from '../pages/login.js';
import { RegisterPage } from '../pages/register.js';
import { useAuthStore } from '../store/auth.js';
export function AppRoutes() {
    const { user, logout } = useAuthStore();
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx("div", { className: "flex min-h-screen items-center justify-center bg-surface-950 text-surface-100", children: _jsxs("div", { className: "text-center space-y-6", children: [_jsx("h1", { className: "text-4xl font-bold tracking-tight text-brand-400", children: "NUVRO API Studio" }), _jsxs("p", { className: "text-surface-300", children: ["Logged in as ", _jsx("span", { className: "font-semibold text-surface-100", children: user?.username })] }), _jsx("div", { children: _jsx("button", { onClick: () => logout(), className: "rounded-lg bg-surface-800 hover:bg-surface-700 px-4 py-2 text-sm font-semibold transition", children: "Logout" }) })] }) }) }) })] }));
}
//# sourceMappingURL=index.js.map