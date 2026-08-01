import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.js';
import { RequestBuilder } from '../components/request-builder/RequestBuilder.js';
import { ResponseViewer } from '../components/response-viewer/ResponseViewer.js';
import { CollectionSidebar } from '../components/sidebar/CollectionSidebar.js';
export function StudioPage() {
    const { user, logout } = useAuthStore();
    const [workspaceId, setWorkspaceId] = useState(null);
    // Fetch the first workspace on mount (the user's default workspace)
    useEffect(() => {
        fetch('/api/v1/workspaces')
            .then((res) => {
            if (!res.ok)
                throw new Error('Failed to load workspaces');
            return res.json();
        })
            .then((payload) => {
            if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
                setWorkspaceId(payload.data[0].id);
            }
        })
            .catch(() => {
            // ignore — workspace may not be loaded yet
        });
    }, []);
    return (_jsxs("div", { className: "flex flex-col min-h-screen bg-surface-950 text-surface-100 font-sans", children: [_jsx("header", { className: "border-b border-surface-900 bg-surface-950/70 backdrop-blur-md sticky top-0 z-50", children: _jsxs("div", { className: "px-4 sm:px-6 h-14 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center font-black text-surface-950 text-xs shadow-glow-brand tracking-tighter select-none", children: "NV" }), _jsxs("h1", { className: "font-extrabold text-base tracking-tight bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400 bg-clip-text text-transparent", children: ["NUVRO ", _jsx("span", { className: "font-light text-surface-300", children: "API Studio" })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right hidden sm:block text-xs text-surface-400 font-semibold uppercase tracking-wider", children: ["Logged in as ", _jsx("span", { className: "text-sm font-bold text-surface-200 block normal-case tracking-normal", children: user?.username })] }), _jsxs("button", { onClick: () => logout(), className: "inline-flex items-center justify-center gap-1.5 rounded-lg bg-surface-900 hover:bg-surface-800 border border-surface-800 text-surface-300 hover:text-surface-100 px-3.5 py-1.5 text-xs font-bold transition-all", "aria-label": "Logout button", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: "w-4 h-4", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" }) }), "Logout"] })] })] }) }), _jsxs("div", { className: "flex flex-1 overflow-hidden", style: { height: 'calc(100vh - 56px)' }, children: [workspaceId && (_jsx(CollectionSidebar, { workspaceId: workspaceId })), _jsxs("main", { className: "flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5", children: [_jsx(RequestBuilder, {}), _jsx(ResponseViewer, {})] })] }), _jsxs("footer", { className: "border-t border-surface-900/60 py-3 text-center text-xs text-surface-500", children: ["\u00A9 ", new Date().getFullYear(), " NUVRO API Studio. Framework-agnostic design model."] })] }));
}
//# sourceMappingURL=StudioPage.js.map