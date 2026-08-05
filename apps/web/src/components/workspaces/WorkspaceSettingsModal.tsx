import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../../store/workspace-store.js';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceSettingsModal({ isOpen, onClose }: WorkspaceSettingsModalProps) {
  const {
    activeWorkspace,
    members,
    currentUserRole,
    membersLoading,
    membersError,
    loadActiveWorkspaceDetail,
    addMember,
    updateRole,
    removeMember,
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<'general' | 'members'>('general');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<boolean>(false);
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

  if (!isOpen || !activeWorkspace) return null;

  const handleAddMember = async (e: React.FormEvent) => {
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
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'MEMBER' | 'VIEWER') => {
    try {
      await updateRole(userId, newRole);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this member from the workspace?')) {
      return;
    }
    try {
      await removeMember(userId);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : String(err));
    }
  };

  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-surface-900 border border-surface-800 rounded-xl shadow-glow-accent overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        data-testid="workspace-settings-modal"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-850 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-surface-50 tracking-tight">Workspace Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-surface-400 hover:text-surface-100 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-surface-850 px-6 bg-surface-950/20">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
              activeTab === 'general'
                ? 'border-brand-500 text-brand-400 font-extrabold'
                : 'border-transparent text-surface-400 hover:text-surface-200'
            }`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
              activeTab === 'members'
                ? 'border-brand-500 text-brand-400 font-extrabold'
                : 'border-transparent text-surface-400 hover:text-surface-200'
            }`}
            data-testid="workspace-members-tab"
          >
            Members
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'general' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block">Workspace Name</label>
                <div className="w-full rounded-lg bg-surface-950 border border-surface-850 px-3.5 py-2 text-sm text-surface-200">
                  {activeWorkspace.name}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block">Workspace Slug</label>
                <div className="w-full rounded-lg bg-surface-950 border border-surface-850 px-3.5 py-2 text-sm text-surface-300 font-mono">
                  {activeWorkspace.slug}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block">Description</label>
                <div className="w-full rounded-lg bg-surface-950 border border-surface-850 px-3.5 py-2 text-sm text-surface-250 min-h-[60px]">
                  {activeWorkspace.description || <span className="text-surface-600 italic">No description provided</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add Member Section */}
              {canManage && (
                <form onSubmit={handleAddMember} className="p-4 bg-surface-950/30 border border-surface-850 rounded-xl space-y-3" data-testid="add-member-form">
                  <h4 className="text-xs font-bold text-surface-200 uppercase tracking-wider">Add Workspace Member</h4>
                  {inviteError && (
                    <div className="p-2.5 bg-error-500/10 border border-error-500/20 text-error-450 rounded-lg text-xs font-semibold">
                      {inviteError}
                    </div>
                  )}
                  {inviteSuccess && (
                    <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg text-xs font-semibold">
                      Member added successfully!
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter user email address"
                      className="flex-1 rounded-lg bg-surface-950 border border-surface-800 focus:border-brand-500/50 hover:border-surface-700/80 px-3 py-1.5 text-xs text-surface-100 placeholder-surface-600 outline-none transition-all"
                      data-testid="invite-email-input"
                      required
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'MEMBER' | 'VIEWER')}
                      className="rounded-lg bg-surface-950 border border-surface-800 focus:border-brand-500/50 hover:border-surface-700 px-3 py-1.5 text-xs text-surface-100 placeholder-surface-600 outline-none transition-all"
                      data-testid="invite-role-select"
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isInviting}
                      className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-surface-950 font-bold text-xs shadow-glow-brand transition-all active:scale-[0.98]"
                      data-testid="invite-member-btn"
                    >
                      {isInviting ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                </form>
              )}

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider">Current Members</h4>
                  {membersLoading && <span className="text-[10px] text-surface-550 animate-pulse font-medium">Refreshing...</span>}
                </div>

                {membersError && (
                  <div className="p-2.5 bg-error-500/10 border border-error-500/20 text-error-450 rounded-lg text-xs font-semibold">
                    {membersError}
                  </div>
                )}

                <div className="border border-surface-850 rounded-xl overflow-hidden bg-surface-950/20">
                  <div className="min-w-full divide-y divide-surface-850">
                    {members.map((member) => {
                      const isOwnerRole = member.role === 'OWNER';
                      const isWorkspaceOwner = member.userId === activeWorkspace.ownerId;
                      // Wait! Can manage role if canManage is true, target user is not workspace owner, and we aren't changing our own role.
                      const canModifyTarget = canManage && !isWorkspaceOwner && member.userId !== useWorkspaceStore.getState().activeWorkspaceDetail?.members.find(m => m.role === 'OWNER')?.userId;

                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 hover:bg-surface-900/40 transition-colors"
                          data-testid={`member-row-${member.email}`}
                        >
                          <div className="flex items-center gap-3">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.username} className="w-8 h-8 rounded-full border border-surface-800" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-surface-800 text-surface-300 flex items-center justify-center font-bold text-xs uppercase border border-surface-750">
                                {member.displayName ? member.displayName.charAt(0) : member.username.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-bold text-surface-150 flex items-center gap-1.5">
                                <span>{member.displayName || member.username}</span>
                                {member.displayName && (
                                  <span className="text-[10px] text-surface-450 font-normal">@{member.username}</span>
                                )}
                              </div>
                              <div className="text-[10px] text-surface-450 mt-0.5">{member.email}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {canModifyTarget ? (
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.userId, e.target.value as 'ADMIN' | 'MEMBER' | 'VIEWER')}
                                className="rounded-lg bg-surface-950 border border-surface-800 focus:border-brand-500/50 hover:border-surface-700 px-2.5 py-1 text-xs text-surface-200 outline-none transition-all"
                                data-testid={`member-role-select-${member.email}`}
                              >
                                <option value="VIEWER">VIEWER</option>
                                <option value="MEMBER">MEMBER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isOwnerRole
                                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                                  : member.role === 'ADMIN'
                                  ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
                                  : member.role === 'MEMBER'
                                  ? 'bg-surface-800 text-surface-300 border border-surface-750'
                                  : 'bg-surface-850 text-surface-450 border border-surface-800'
                              }`} data-testid={`member-role-badge-${member.email}`}>
                                {member.role}
                              </span>
                            )}

                            {canModifyTarget && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member.userId)}
                                className="p-1 rounded-lg text-surface-450 hover:text-error-450 hover:bg-error-500/5 transition-all active:scale-95"
                                data-testid={`remove-member-btn-${member.email}`}
                                aria-label={`Remove member ${member.email}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
