import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../../store/workspace-store.js';
export function WorkspaceSettingsModal({ isOpen, onClose }) {
    const { activeWorkspace, members, currentUserRole, membersLoading, membersError, loadActiveWorkspaceDetail, addMember, updateRole, removeMember, } = useWorkspaceStore();
    const [activeTab, setActiveTab] = useState('general');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('MEMBER');
    const [inviteError, setInviteError] = useState(null);
    const [inviteSuccess, setInviteSuccess] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    useEffect(() => {
        if (isOpen) {
            loadActiveWorkspaceDetail();
            setInviteEmail('');
            setInviteRole('MEMBER');
            setInviteError(null);
            setInviteSuccess(false);
        }
    }, [isOpen, loadActiveWorkspaceDetail]);
    if (!isOpen || !activeWorkspace)
        return null;
    const handleAddMember = async (e) => {
        e.preventDefault();
        setInviteError(null);
        setInviteSuccess(false);
        if (!inviteEmail.trim()) {
            setInviteError('Email is required');
            return;
        }
        setIsInviting(true);
        try {
            await addMember(inviteEmail.trim(), inviteRole);
            setInviteEmail('');
            setInviteSuccess(true);
        }
        catch (err) {
            setInviteError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setIsInviting(false);
        }
    };
    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateRole(userId, newRole);
        }
        catch (err) {
            window.alert(err instanceof Error ? err.message : String(err));
        }
    };
    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member from the workspace?')) {
            return;
        }
        try {
            await removeMember(userId);
        }
        catch (err) {
            window.alert(err instanceof Error ? err.message : String(err));
        }
    };
    const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-surface-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200", children: _jsxs("div", { className: "w-full max-w-2xl bg-surface-900 border border-surface-800 rounded-xl shadow-glow-accent overflow-hidden animate-in fade-in zoom-in-95 duration-200", "data-testid": "workspace-settings-modal", children: [_jsxs("div", { className: "px-6 py-4 border-b border-surface-850 flex items-center justify-between", children: [_jsx("h3", { className: "font-extrabold text-base text-surface-50 tracking-tight", children: "Workspace Settings" }), _jsx("button", { type: "button", onClick: onClose, className: "text-surface-400 hover:text-surface-100 transition-colors", "aria-label": "Close modal", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2.5, stroke: "currentColor", className: "w-5 h-5", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "flex border-b border-surface-850 px-6 bg-surface-950/20", children: [_jsx("button", { type: "button", onClick: () => setActiveTab('general'), className: `px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] ${activeTab === 'general'
                                ? 'border-brand-500 text-brand-400 font-extrabold'
                                : 'border-transparent text-surface-400 hover:text-surface-200'}`, children: "General" }), _jsx("button", { type: "button", onClick: () => setActiveTab('members'), className: `px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] ${activeTab === 'members'
                                ? 'border-brand-500 text-brand-400 font-extrabold'
                                : 'border-transparent text-surface-400 hover:text-surface-200'}`, "data-testid": "workspace-members-tab", children: "Members" })] }), _jsx("div", { className: "p-6 max-h-[60vh] overflow-y-auto", children: activeTab === 'general' ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[11px] font-bold text-surface-400 uppercase tracking-wider block", children: "Workspace Name" }), _jsx("div", { className: "w-full rounded-lg bg-surface-950 border border-surface-850 px-3.5 py-2 text-sm text-surface-200", children: activeWorkspace.name })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[11px] font-bold text-surface-400 uppercase tracking-wider block", children: "Workspace Slug" }), _jsx("div", { className: "w-full rounded-lg bg-surface-950 border border-surface-850 px-3.5 py-2 text-sm text-surface-300 font-mono", children: activeWorkspace.slug })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[11px] font-bold text-surface-400 uppercase tracking-wider block", children: "Description" }), _jsx("div", { className: "w-full rounded-lg bg-surface-950 border border-surface-850 px-3.5 py-2 text-sm text-surface-250 min-h-[60px]", children: activeWorkspace.description || _jsx("span", { className: "text-surface-600 italic", children: "No description provided" }) })] })] })) : (_jsxs("div", { className: "space-y-6", children: [canManage && (_jsxs("form", { onSubmit: handleAddMember, className: "p-4 bg-surface-950/30 border border-surface-850 rounded-xl space-y-3", "data-testid": "add-member-form", children: [_jsx("h4", { className: "text-xs font-bold text-surface-200 uppercase tracking-wider", children: "Add Workspace Member" }), inviteError && (_jsx("div", { className: "p-2.5 bg-error-500/10 border border-error-500/20 text-error-450 rounded-lg text-xs font-semibold", children: inviteError })), inviteSuccess && (_jsx("div", { className: "p-2.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg text-xs font-semibold", children: "Member added successfully!" })), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsx("input", { type: "email", value: inviteEmail, onChange: (e) => setInviteEmail(e.target.value), placeholder: "Enter user email address", className: "flex-1 rounded-lg bg-surface-950 border border-surface-800 focus:border-brand-500/50 hover:border-surface-700/80 px-3 py-1.5 text-xs text-surface-100 placeholder-surface-600 outline-none transition-all", "data-testid": "invite-email-input", required: true }), _jsxs("select", { value: inviteRole, onChange: (e) => setInviteRole(e.target.value), className: "rounded-lg bg-surface-950 border border-surface-800 focus:border-brand-500/50 hover:border-surface-700 px-3 py-1.5 text-xs text-surface-100 placeholder-surface-600 outline-none transition-all", "data-testid": "invite-role-select", children: [_jsx("option", { value: "MEMBER", children: "MEMBER" }), _jsx("option", { value: "ADMIN", children: "ADMIN" }), _jsx("option", { value: "VIEWER", children: "VIEWER" })] }), _jsx("button", { type: "submit", disabled: isInviting, className: "px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-surface-950 font-bold text-xs shadow-glow-brand transition-all active:scale-[0.98]", "data-testid": "invite-member-btn", children: isInviting ? 'Adding...' : 'Add Member' })] })] })), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-xs font-bold text-surface-400 uppercase tracking-wider", children: "Current Members" }), membersLoading && _jsx("span", { className: "text-[10px] text-surface-550 animate-pulse font-medium", children: "Refreshing..." })] }), membersError && (_jsx("div", { className: "p-2.5 bg-error-500/10 border border-error-500/20 text-error-450 rounded-lg text-xs font-semibold", children: membersError })), _jsx("div", { className: "border border-surface-850 rounded-xl overflow-hidden bg-surface-950/20", children: _jsx("div", { className: "min-w-full divide-y divide-surface-850", children: members.map((member) => {
                                                const isOwnerRole = member.role === 'OWNER';
                                                const isWorkspaceOwner = member.userId === activeWorkspace.ownerId;
                                                // Wait! Can manage role if canManage is true, target user is not workspace owner, and we aren't changing our own role.
                                                const canModifyTarget = canManage && !isWorkspaceOwner && member.userId !== useWorkspaceStore.getState().activeWorkspaceDetail?.members.find(m => m.role === 'OWNER')?.userId;
                                                return (_jsxs("div", { className: "flex items-center justify-between p-4 hover:bg-surface-900/40 transition-colors", "data-testid": `member-row-${member.email}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [member.avatarUrl ? (_jsx("img", { src: member.avatarUrl, alt: member.username, className: "w-8 h-8 rounded-full border border-surface-800" })) : (_jsx("div", { className: "w-8 h-8 rounded-full bg-surface-800 text-surface-300 flex items-center justify-center font-bold text-xs uppercase border border-surface-750", children: member.displayName ? member.displayName.charAt(0) : member.username.charAt(0) })), _jsxs("div", { children: [_jsxs("div", { className: "text-xs font-bold text-surface-150 flex items-center gap-1.5", children: [_jsx("span", { children: member.displayName || member.username }), member.displayName && (_jsxs("span", { className: "text-[10px] text-surface-450 font-normal", children: ["@", member.username] }))] }), _jsx("div", { className: "text-[10px] text-surface-450 mt-0.5", children: member.email })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [canModifyTarget ? (_jsxs("select", { value: member.role, onChange: (e) => handleRoleChange(member.userId, e.target.value), className: "rounded-lg bg-surface-950 border border-surface-800 focus:border-brand-500/50 hover:border-surface-700 px-2.5 py-1 text-xs text-surface-200 outline-none transition-all", "data-testid": `member-role-select-${member.email}`, children: [_jsx("option", { value: "VIEWER", children: "VIEWER" }), _jsx("option", { value: "MEMBER", children: "MEMBER" }), _jsx("option", { value: "ADMIN", children: "ADMIN" })] })) : (_jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isOwnerRole
                                                                        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                                                                        : member.role === 'ADMIN'
                                                                            ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
                                                                            : member.role === 'MEMBER'
                                                                                ? 'bg-surface-800 text-surface-300 border border-surface-750'
                                                                                : 'bg-surface-850 text-surface-450 border border-surface-800'}`, "data-testid": `member-role-badge-${member.email}`, children: member.role })), canModifyTarget && (_jsx("button", { type: "button", onClick: () => handleRemoveMember(member.userId), className: "p-1 rounded-lg text-surface-450 hover:text-error-450 hover:bg-error-500/5 transition-all active:scale-95", "data-testid": `remove-member-btn-${member.email}`, "aria-label": `Remove member ${member.email}`, children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: "w-4 h-4", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" }) }) }))] })] }, member.id));
                                            }) }) })] })] })) })] }) }));
}
//# sourceMappingURL=WorkspaceSettingsModal.js.map