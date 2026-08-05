import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspace-store.js';
export function WorkspaceModal({ isOpen, onClose }) {
    const { createWorkspace, isLoading, error } = useWorkspaceStore();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [validationError, setValidationError] = useState(null);
    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError(null);
        if (!name.trim()) {
            setValidationError('Workspace name is required');
            return;
        }
        try {
            await createWorkspace({
                name: name.trim(),
                slug: slug.trim() || undefined,
                description: description.trim() || undefined,
            });
            setName('');
            setSlug('');
            setDescription('');
            onClose();
        }
        catch {
            // Error is stored in the workspace store
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-surface-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200", children: _jsxs("div", { className: "w-full max-w-md bg-surface-900 border border-surface-800 rounded-xl shadow-glow-accent overflow-hidden animate-in fade-in zoom-in-95 duration-200", "data-testid": "create-workspace-modal", children: [_jsxs("div", { className: "px-6 py-4 border-b border-surface-850 flex items-center justify-between", children: [_jsx("h3", { className: "font-extrabold text-base text-surface-50 tracking-tight", children: "Create New Workspace" }), _jsx("button", { type: "button", onClick: onClose, className: "text-surface-400 hover:text-surface-100 transition-colors", "aria-label": "Close modal", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2.5, stroke: "currentColor", className: "w-5 h-5", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [error && (_jsx("div", { className: "p-3 bg-error-500/10 border border-error-500/20 text-error-450 rounded-lg text-xs font-semibold", children: error })), validationError && (_jsx("div", { className: "p-3 bg-error-500/10 border border-error-500/20 text-error-450 rounded-lg text-xs font-semibold", children: validationError })), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[11px] font-bold text-surface-400 uppercase tracking-wider block", children: "Workspace Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Acme API Development", className: "w-full rounded-lg bg-surface-950 border border-surface-800/80 focus:border-brand-500/50 hover:border-surface-700/80 px-3.5 py-2 text-sm text-surface-100 placeholder-surface-600 outline-none transition-all", "data-testid": "workspace-name-input", required: true })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[11px] font-bold text-surface-400 uppercase tracking-wider block", children: "Slug (Optional)" }), _jsx("input", { type: "text", value: slug, onChange: (e) => setSlug(e.target.value), placeholder: "e.g. acme-api-dev", className: "w-full rounded-lg bg-surface-950 border border-surface-800/80 focus:border-brand-500/50 hover:border-surface-700/80 px-3.5 py-2 text-sm text-surface-100 placeholder-surface-600 outline-none transition-all", "data-testid": "workspace-slug-input" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[11px] font-bold text-surface-400 uppercase tracking-wider block", children: "Description (Optional)" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Provide a description for this workspace", rows: 3, className: "w-full rounded-lg bg-surface-950 border border-surface-800/80 focus:border-brand-500/50 hover:border-surface-700/80 px-3.5 py-2 text-sm text-surface-100 placeholder-surface-600 outline-none transition-all resize-none", "data-testid": "workspace-description-input" })] }), _jsxs("div", { className: "pt-2 flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-xs font-bold text-surface-400 hover:text-surface-100 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isLoading, className: "px-4 py-2 text-xs font-bold text-surface-950 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 rounded-lg shadow-glow-brand transition-all active:scale-[0.98]", "data-testid": "submit-workspace-btn", children: isLoading ? 'Creating...' : 'Create Workspace' })] })] })] }) }));
}
//# sourceMappingURL=WorkspaceModal.js.map