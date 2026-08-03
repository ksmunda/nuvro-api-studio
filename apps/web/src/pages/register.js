import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.js';
export function RegisterPage() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error?.message || 'Registration failed');
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
    return (_jsxs("div", { className: "flex min-h-screen items-center justify-center bg-surface-950 px-4 select-none relative overflow-hidden", children: [_jsx("div", { className: "absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" }), _jsx("div", { className: "absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px] pointer-events-none" }), _jsxs("div", { className: "w-full max-w-md space-y-8 rounded-2xl border border-surface-800/80 bg-surface-900/40 p-8 shadow-2xl backdrop-blur-xl animate-fade-in relative", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center gap-2.5 mb-6", children: [_jsx("div", { className: "h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-black text-surface-950 text-sm shadow-glow-brand tracking-tighter select-none", children: "NV" }), _jsxs("h1", { className: "font-extrabold text-lg tracking-tight text-surface-100", children: ["NUVRO ", _jsx("span", { className: "font-light text-surface-400", children: "API Studio" })] })] }), _jsx("h2", { className: "text-2xl font-bold tracking-tight text-brand-400", children: "Create Account" }), _jsx("p", { className: "mt-1.5 text-xs text-surface-400", children: "Get started with NUVRO API Studio" })] }), error && (_jsx("div", { className: "rounded-lg bg-red-500/10 p-3.5 border border-red-500/20 text-xs text-red-400 font-medium", children: error })), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5", children: "Email Address" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-lg border border-surface-800 bg-surface-950/80 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-700 transition focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20", placeholder: "developer@nuvro.dev" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5", children: "Username" }), _jsx("input", { type: "text", required: true, value: username, onChange: (e) => setUsername(e.target.value), className: "w-full rounded-lg border border-surface-800 bg-surface-950/80 px-3.5 py-2.5 text-sm text-surface-100 placeholder-surface-700 transition focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20", placeholder: "dev_user" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? 'text' : 'password', required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-lg border border-surface-800 bg-surface-950/80 pl-3.5 pr-10 py-2.5 text-sm text-surface-100 placeholder-surface-700 transition focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20", placeholder: "Min. 8 characters" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition focus:outline-none", "aria-label": showPassword ? 'Hide password' : 'Show password', children: showPassword ? (_jsx("span", { className: "text-xs font-semibold", children: "HIDE" })) : (_jsx("span", { className: "text-xs font-semibold", children: "SHOW" })) })] })] })] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: isLoading, className: "flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-bold text-surface-950 shadow-lg shadow-brand-500/10 transition hover:bg-brand-400 active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:pointer-events-none", children: isLoading ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin h-4 w-4 text-surface-950", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), _jsx("span", { children: "Creating account..." })] })) : ('Create account') }) })] }), _jsxs("div", { className: "text-center text-xs text-surface-450 pt-2", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "font-bold text-brand-400 hover:text-brand-300 transition", children: "Sign in here" })] })] })] }));
}
//# sourceMappingURL=register.js.map