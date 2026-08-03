import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useEnvironmentStore } from '../../store/environment-store.js';
export function EnvironmentModal({ workspaceId, isOpen, onClose }) {
    const { environments, activeEnvironmentDetail, isSaving, loadEnvironments, selectEnvironment, createEnvironment, updateEnvironment, deleteEnvironment, duplicateEnvironment, addVariable, updateVariable, deleteVariable, } = useEnvironmentStore();
    const [selectedEnvId, setSelectedEnvId] = useState(null);
    const [newEnvName, setNewEnvName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [revealSecrets, setRevealSecrets] = useState({});
    // Variable input states for adding a new variable
    const [newVarKey, setNewVarKey] = useState('');
    const [newVarValue, setNewVarValue] = useState('');
    const [newVarIsSecret, setNewVarIsSecret] = useState(false);
    const [newVarDesc, setNewVarDesc] = useState('');
    // Load environments when modal opens
    useEffect(() => {
        if (isOpen && workspaceId) {
            loadEnvironments(workspaceId);
        }
    }, [isOpen, workspaceId, loadEnvironments]);
    // Set default selected environment once list is loaded
    useEffect(() => {
        if (environments.length > 0 && !selectedEnvId) {
            setSelectedEnvId(environments[0]?.id || null);
        }
    }, [environments, selectedEnvId]);
    // Load active environment detail when selectedEnvId changes
    useEffect(() => {
        if (selectedEnvId) {
            selectEnvironment(selectedEnvId, workspaceId);
        }
    }, [selectedEnvId, selectEnvironment, workspaceId]);
    if (!isOpen)
        return null;
    const handleCreateEnv = async (e) => {
        e.preventDefault();
        if (!newEnvName.trim())
            return;
        try {
            const newEnv = await createEnvironment(workspaceId, newEnvName.trim());
            setSelectedEnvId(newEnv.id);
            setNewEnvName('');
            setShowCreateForm(false);
        }
        catch {
            // Handled in store
        }
    };
    const handleDuplicateEnv = async (env) => {
        const dupName = window.prompt('Name for duplicate environment:', `${env.name} Copy`);
        if (!dupName?.trim())
            return;
        try {
            const duplicated = await duplicateEnvironment(env.id, dupName.trim());
            setSelectedEnvId(duplicated.id);
        }
        catch {
            // Handled in store
        }
    };
    const handleDeleteEnv = async (env) => {
        if (window.confirm(`Delete environment "${env.name}"? This will remove all of its variables.`)) {
            try {
                await deleteEnvironment(env.id, workspaceId);
                setSelectedEnvId(environments.length > 1 ? environments.find((e) => e.id !== env.id)?.id || null : null);
            }
            catch {
                // Handled in store
            }
        }
    };
    const handleRenameEnv = async (env) => {
        const newName = window.prompt('Rename environment:', env.name);
        if (!newName?.trim() || newName.trim() === env.name)
            return;
        try {
            await updateEnvironment(env.id, newName.trim());
        }
        catch {
            // Handled in store
        }
    };
    const handleAddVar = async () => {
        if (!selectedEnvId || !newVarKey.trim())
            return;
        try {
            await addVariable(selectedEnvId, {
                key: newVarKey.trim().toUpperCase(),
                value: newVarValue,
                isSecret: newVarIsSecret,
                description: newVarDesc || undefined,
                enabled: true,
            });
            setNewVarKey('');
            setNewVarValue('');
            setNewVarIsSecret(false);
            setNewVarDesc('');
        }
        catch {
            // Handled in store
        }
    };
    const toggleSecretReveal = (varId) => {
        setRevealSecrets((prev) => ({ ...prev, [varId]: !prev[varId] }));
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-surface-950/85 backdrop-blur-sm px-4", children: _jsxs("div", { className: "bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-surface-800 flex items-center justify-between shrink-0", children: [_jsxs("h2", { className: "text-base font-bold text-surface-100 flex items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-brand-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" }) }), "Environments & Variables"] }), _jsx("button", { type: "button", onClick: onClose, className: "text-surface-400 hover:text-surface-200 transition-colors", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2.5, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsxs("div", { className: "w-64 border-r border-surface-800 flex flex-col p-4 space-y-4 shrink-0 bg-surface-950/30", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-[10px] font-bold text-surface-500 uppercase tracking-widest", children: "Environments" }), _jsx("button", { type: "button", onClick: () => setShowCreateForm(true), className: "text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5", children: "+ New" })] }), showCreateForm && (_jsxs("form", { onSubmit: handleCreateEnv, className: "space-y-2 bg-surface-900 border border-surface-800 rounded-lg p-2.5", children: [_jsx("input", { autoFocus: true, type: "text", placeholder: "e.g. Production", value: newEnvName, onChange: (e) => setNewEnvName(e.target.value), className: "w-full bg-surface-950 border border-surface-800 rounded px-2 py-1 text-xs text-surface-100 placeholder-surface-600 outline-none focus:border-brand-500" }), _jsxs("div", { className: "flex justify-end gap-1.5 text-[10px]", children: [_jsx("button", { type: "button", onClick: () => {
                                                        setShowCreateForm(false);
                                                        setNewEnvName('');
                                                    }, className: "px-2 py-1 border border-surface-800 text-surface-400 rounded hover:text-surface-200", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSaving || !newEnvName.trim(), className: "px-2.5 py-1 bg-brand-500 hover:bg-brand-400 text-surface-950 font-bold rounded disabled:opacity-50", children: "Create" })] })] })), _jsxs("div", { className: "flex-1 overflow-y-auto space-y-1 pr-1", children: [environments.map((env) => (_jsxs("div", { onClick: () => setSelectedEnvId(env.id), className: `group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${selectedEnvId === env.id
                                                ? 'bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20'
                                                : 'text-surface-300 hover:bg-surface-800/60 border border-transparent'}`, children: [_jsx("span", { className: "truncate", children: env.name }), _jsxs("div", { className: "hidden group-hover:flex items-center gap-1.5 ml-2", children: [_jsx("button", { type: "button", title: "Rename", onClick: (e) => {
                                                                e.stopPropagation();
                                                                handleRenameEnv(env);
                                                            }, className: "text-surface-500 hover:text-surface-200", children: "\u270F\uFE0F" }), _jsx("button", { type: "button", title: "Duplicate", onClick: (e) => {
                                                                e.stopPropagation();
                                                                handleDuplicateEnv(env);
                                                            }, className: "text-surface-500 hover:text-surface-200", children: "\uD83D\uDCCB" }), _jsx("button", { type: "button", title: "Delete", onClick: (e) => {
                                                                e.stopPropagation();
                                                                handleDeleteEnv(env);
                                                            }, className: "text-surface-500 hover:text-red-400", children: "\uD83D\uDDD1\uFE0F" })] })] }, env.id))), environments.length === 0 && (_jsx("div", { className: "text-center py-6 text-xs text-surface-600 italic", children: "No environments created" }))] })] }), _jsx("div", { className: "flex-1 flex flex-col p-6 overflow-hidden", children: activeEnvironmentDetail ? (_jsxs("div", { className: "flex-1 flex flex-col overflow-hidden space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between shrink-0", children: [_jsxs("h3", { className: "text-sm font-bold text-surface-200", children: ["Variables for ", _jsx("span", { className: "text-brand-400 font-black", children: activeEnvironmentDetail.name })] }), _jsxs("span", { className: "text-xs text-surface-500", children: [activeEnvironmentDetail.variables.length, " variable(s)"] })] }), _jsx("div", { className: "flex-1 overflow-y-auto border border-surface-800 rounded-xl bg-surface-950/20 pr-1", children: _jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-surface-800 bg-surface-950/40 text-surface-500 font-bold", children: [_jsx("th", { className: "px-4 py-2.5 w-1/3", children: "Key" }), _jsx("th", { className: "px-4 py-2.5 w-2/5", children: "Value" }), _jsx("th", { className: "px-4 py-2.5 text-center w-16", children: "Secret" }), _jsx("th", { className: "px-4 py-2.5 text-center w-16", children: "Enabled" }), _jsx("th", { className: "px-4 py-2.5 text-right w-16", children: "Actions" })] }) }), _jsxs("tbody", { className: "divide-y divide-surface-800/60", children: [activeEnvironmentDetail.variables.map((variable) => (_jsxs("tr", { className: "hover:bg-surface-800/20 text-surface-300", children: [_jsx("td", { className: "px-4 py-2", children: _jsx("input", { type: "text", value: variable.key, onChange: (e) => updateVariable(activeEnvironmentDetail.id, variable.id, {
                                                                            key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
                                                                        }), className: "bg-transparent outline-none w-full text-xs font-mono font-semibold focus:border-brand-500/30 border border-transparent rounded px-1 text-surface-200" }) }), _jsx("td", { className: "px-4 py-2 relative", children: variable.isSecret && !revealSecrets[variable.id] ? (_jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx("span", { className: "font-mono text-surface-500 py-1", children: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", onClick: () => toggleSecretReveal(variable.id), className: "text-[10px] text-brand-400 hover:text-brand-300 font-semibold px-2 py-0.5 border border-brand-500/20 hover:border-brand-500/30 rounded", children: "Reveal" })] })) : (_jsxs("div", { className: "flex items-center gap-1.5 w-full", children: [_jsx("input", { type: "text", value: variable.value, placeholder: variable.isSecret ? 'Enter new secret value' : 'Value', onChange: (e) => updateVariable(activeEnvironmentDetail.id, variable.id, {
                                                                                    value: e.target.value,
                                                                                }), className: "bg-transparent outline-none flex-1 text-xs font-mono focus:border-brand-500/30 border border-transparent rounded px-1" }), variable.isSecret && (_jsx("button", { type: "button", onClick: () => toggleSecretReveal(variable.id), className: "text-[10px] text-surface-400 hover:text-surface-200 font-semibold px-2 py-0.5 border border-surface-800 rounded", children: "Mask" }))] })) }), _jsx("td", { className: "px-4 py-2 text-center", children: _jsx("input", { type: "checkbox", checked: variable.isSecret, onChange: (e) => updateVariable(activeEnvironmentDetail.id, variable.id, {
                                                                            isSecret: e.target.checked,
                                                                        }), className: "accent-brand-500 h-3.5 w-3.5 cursor-pointer" }) }), _jsx("td", { className: "px-4 py-2 text-center", children: _jsx("input", { type: "checkbox", checked: variable.enabled, onChange: (e) => updateVariable(activeEnvironmentDetail.id, variable.id, {
                                                                            enabled: e.target.checked,
                                                                        }), className: "accent-brand-500 h-3.5 w-3.5 cursor-pointer" }) }), _jsx("td", { className: "px-4 py-2 text-right", children: _jsx("button", { type: "button", onClick: () => deleteVariable(activeEnvironmentDetail.id, variable.id), className: "text-surface-500 hover:text-red-400 font-bold px-1.5", children: "\u2715" }) })] }, variable.id))), _jsxs("tr", { className: "bg-surface-950/30", children: [_jsx("td", { className: "px-4 py-3", children: _jsx("input", { type: "text", placeholder: "NEW_VARIABLE", value: newVarKey, onChange: (e) => setNewVarKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '')), className: "bg-transparent border border-surface-800 focus:border-brand-500 rounded px-2 py-1 text-xs w-full outline-none font-mono font-semibold placeholder-surface-700" }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("input", { type: "text", placeholder: "value", value: newVarValue, onChange: (e) => setNewVarValue(e.target.value), className: "bg-transparent border border-surface-800 focus:border-brand-500 rounded px-2 py-1 text-xs w-full outline-none font-mono placeholder-surface-700" }) }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("input", { type: "checkbox", checked: newVarIsSecret, onChange: (e) => setNewVarIsSecret(e.target.checked), className: "accent-brand-500 h-3.5 w-3.5 cursor-pointer" }) }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("span", { className: "text-[10px] text-surface-500 font-semibold select-none", children: "\u2713" }) }), _jsx("td", { className: "px-4 py-3 text-right", children: _jsx("button", { type: "button", onClick: handleAddVar, disabled: !newVarKey.trim(), className: "text-xs text-brand-400 hover:text-brand-300 font-bold border border-brand-500/20 hover:border-brand-500/30 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed", children: "+ Add" }) })] })] })] }) })] })) : (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center space-y-3", children: [_jsx("svg", { className: "w-10 h-10 text-surface-700", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" }) }), _jsx("p", { className: "text-xs text-surface-500", children: "Create or select an environment to manage variables." })] })) })] }), _jsx("div", { className: "px-6 py-4 border-t border-surface-800 bg-surface-950/20 flex justify-end shrink-0", children: _jsx("button", { type: "button", onClick: onClose, className: "px-5 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-surface-100 font-bold text-xs rounded-xl transition-all", children: "Close" }) })] }) }));
}
//# sourceMappingURL=EnvironmentModal.js.map