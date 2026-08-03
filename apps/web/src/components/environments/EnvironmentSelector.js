import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { useEnvironmentStore } from '../../store/environment-store.js';
export function EnvironmentSelector({ workspaceId, onManageClick }) {
    const { environments, activeEnvironmentId, loadEnvironments, selectEnvironment, } = useEnvironmentStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        if (workspaceId) {
            loadEnvironments(workspaceId);
        }
    }, [workspaceId, loadEnvironments]);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const activeEnv = environments.find((e) => e.id === activeEnvironmentId);
    return (_jsxs("div", { className: "relative inline-block text-left", ref: dropdownRef, children: [_jsxs("button", { type: "button", id: "env-selector-btn", className: "flex items-center gap-1.5 bg-surface-900 border border-surface-800 rounded-lg px-3 py-1.5 hover:bg-surface-800 transition-colors cursor-pointer outline-none focus:border-brand-500", onClick: () => setIsOpen((prev) => !prev), children: [_jsx("svg", { className: "w-3.5 h-3.5 text-surface-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" }) }), _jsx("span", { className: "text-xs text-surface-300 font-semibold select-none", children: activeEnv ? activeEnv.name : 'No Environment' }), _jsx("svg", { className: "w-3 h-3 text-surface-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2.5, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 8.25l-7.5 7.5-7.5-7.5" }) })] }), isOpen && (_jsxs("div", { className: "absolute right-0 mt-1.5 w-52 origin-top-right rounded-lg bg-surface-900 border border-surface-800 shadow-2xl z-50 py-1 text-xs", children: [_jsx("div", { className: "px-3 py-1.5 text-[10px] font-bold text-surface-500 uppercase tracking-wider", children: "Environments" }), _jsxs("button", { type: "button", onClick: async () => {
                            await selectEnvironment(null, workspaceId);
                            setIsOpen(false);
                        }, className: `w-full text-left px-3 py-2 hover:bg-surface-800 transition-colors flex items-center justify-between ${!activeEnvironmentId ? 'text-brand-400 font-bold bg-brand-500/5' : 'text-surface-300'}`, children: [_jsx("span", { children: "No Environment" }), !activeEnvironmentId && (_jsx("svg", { className: "w-3.5 h-3.5 text-brand-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2.5, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12.75l6 6 9-13.5" }) }))] }), environments.map((env) => (_jsxs("button", { type: "button", onClick: async () => {
                            await selectEnvironment(env.id, workspaceId);
                            setIsOpen(false);
                        }, className: `w-full text-left px-3 py-2 hover:bg-surface-800 transition-colors flex items-center justify-between ${activeEnvironmentId === env.id ? 'text-brand-400 font-bold bg-brand-500/5' : 'text-surface-300'}`, children: [_jsx("span", { className: "truncate", children: env.name }), activeEnvironmentId === env.id && (_jsx("svg", { className: "w-3.5 h-3.5 text-brand-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2.5, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12.75l6 6 9-13.5" }) }))] }, env.id))), _jsx("div", { className: "border-t border-surface-800 my-1" }), _jsx("button", { type: "button", onClick: () => {
                            onManageClick();
                            setIsOpen(false);
                        }, className: "w-full text-left px-3 py-2 text-brand-400 hover:text-brand-300 hover:bg-surface-800 transition-colors font-semibold", children: "Manage Environments" })] }))] }));
}
//# sourceMappingURL=EnvironmentSelector.js.map