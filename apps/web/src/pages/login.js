import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.js';
export function LoginPage() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error?.message || 'Login failed');
            }
            setUser(data.data.user);
            navigate('/');
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-surface-950 px-4", children: _jsxs("div", { className: "w-full max-w-md space-y-8 rounded-2xl border border-surface-800 bg-surface-900/50 p-8 shadow-xl backdrop-blur-md", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-6", children: [_jsx("div", { className: "h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center font-black text-surface-950 text-xs shadow-glow-brand tracking-tighter select-none", children: "NV" }), _jsxs("h1", { className: "font-extrabold text-base tracking-tight text-surface-200", children: ["NUVRO ", _jsx("span", { className: "font-light text-surface-450", children: "API Studio" })] })] }), _jsx("h2", { className: "text-2xl font-bold tracking-tight text-brand-400", children: "Welcome Back" }), _jsx("p", { className: "mt-1.5 text-xs text-surface-400", children: "Sign in to your NUVRO account" })] }), error && (_jsx("div", { className: "rounded-lg bg-error-500/10 p-4 border border-error-500/20 text-sm text-error-400", children: error })), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { className: "space-y-4 rounded-md", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-surface-400", children: "Email Address" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-surface-100 placeholder-surface-500 focus:border-brand-500 focus:outline-none", placeholder: "developer@nuvro.dev" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-surface-400", children: "Password" }), _jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1 w-full rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-surface-100 placeholder-surface-500 focus:border-brand-500 focus:outline-none", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] })] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: isLoading, className: "flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-surface-950 shadow-md transition hover:bg-brand-400 focus:outline-none disabled:opacity-50", children: isLoading ? 'Signing in...' : 'Sign in' }) })] }), _jsxs("div", { className: "text-center text-sm text-surface-400", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", className: "font-semibold text-brand-400 hover:text-brand-300", children: "Register here" })] })] }) }));
}
//# sourceMappingURL=login.js.map