import React, { useState, useEffect } from 'react';
import { useEnvironmentStore } from '../../store/environment-store.js';
import type { Environment } from '@nuvro/types';

interface EnvironmentModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EnvironmentModal({ workspaceId, isOpen, onClose }: EnvironmentModalProps) {
  const {
    environments,
    activeEnvironmentDetail,
    isSaving,
    loadEnvironments,
    selectEnvironment,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    duplicateEnvironment,
    addVariable,
    updateVariable,
    deleteVariable,
  } = useEnvironmentStore();

  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [revealSecrets, setRevealSecrets] = useState<Record<string, boolean>>({});

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

  if (!isOpen) return null;

  const handleCreateEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim()) return;
    try {
      const newEnv = await createEnvironment(workspaceId, newEnvName.trim());
      setSelectedEnvId(newEnv.id);
      setNewEnvName('');
      setShowCreateForm(false);
    } catch {
      // Handled in store
    }
  };

  const handleDuplicateEnv = async (env: Environment) => {
    const dupName = window.prompt('Name for duplicate environment:', `${env.name} Copy`);
    if (!dupName?.trim()) return;
    try {
      const duplicated = await duplicateEnvironment(env.id, dupName.trim());
      setSelectedEnvId(duplicated.id);
    } catch {
      // Handled in store
    }
  };

  const handleDeleteEnv = async (env: Environment) => {
    if (window.confirm(`Delete environment "${env.name}"? This will remove all of its variables.`)) {
      try {
        await deleteEnvironment(env.id, workspaceId);
        setSelectedEnvId(environments.length > 1 ? environments.find((e) => e.id !== env.id)?.id || null : null);
      } catch {
        // Handled in store
      }
    }
  };

  const handleRenameEnv = async (env: Environment) => {
    const newName = window.prompt('Rename environment:', env.name);
    if (!newName?.trim() || newName.trim() === env.name) return;
    try {
      await updateEnvironment(env.id, newName.trim());
    } catch {
      // Handled in store
    }
  };

  const handleAddVar = async () => {
    if (!selectedEnvId || !newVarKey.trim()) return;
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
    } catch {
      // Handled in store
    }
  };

  const toggleSecretReveal = (varId: string) => {
    setRevealSecrets((prev) => ({ ...prev, [varId]: !prev[varId] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/85 backdrop-blur-sm px-4">
      <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-surface-800 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-surface-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Environments & Variables
          </h2>
          <button type="button" onClick={onClose} className="text-surface-400 hover:text-surface-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Environments List */}
          <div className="w-64 border-r border-surface-800 flex flex-col p-4 space-y-4 shrink-0 bg-surface-950/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Environments</span>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5"
              >
                + New
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateEnv} className="space-y-2 bg-surface-900 border border-surface-800 rounded-lg p-2.5">
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Production"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded px-2 py-1 text-xs text-surface-100 placeholder-surface-600 outline-none focus:border-brand-500"
                />
                <div className="flex justify-end gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewEnvName('');
                    }}
                    className="px-2 py-1 border border-surface-800 text-surface-400 rounded hover:text-surface-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !newEnvName.trim()}
                    className="px-2.5 py-1 bg-brand-500 hover:bg-brand-400 text-surface-950 font-bold rounded disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {environments.map((env) => (
                <div
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                    selectedEnvId === env.id
                      ? 'bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20'
                      : 'text-surface-300 hover:bg-surface-800/60 border border-transparent'
                  }`}
                >
                  <span className="truncate">{env.name}</span>
                  <div className="hidden group-hover:flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      title="Rename"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameEnv(env);
                      }}
                      className="text-surface-500 hover:text-surface-200"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      title="Duplicate"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateEnv(env);
                      }}
                      className="text-surface-500 hover:text-surface-200"
                    >
                      📋
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEnv(env);
                      }}
                      className="text-surface-500 hover:text-red-400"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {environments.length === 0 && (
                <div className="text-center py-6 text-xs text-surface-600 italic">No environments created</div>
              )}
            </div>
          </div>

          {/* Right Panel: Variable Manager Table */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {activeEnvironmentDetail ? (
              <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                <div className="flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-bold text-surface-200">
                    Variables for <span className="text-brand-400 font-black">{activeEnvironmentDetail.name}</span>
                  </h3>
                  <span className="text-xs text-surface-500">
                    {activeEnvironmentDetail.variables.length} variable(s)
                  </span>
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-y-auto border border-surface-800 rounded-xl bg-surface-950/20 pr-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-surface-800 bg-surface-950/40 text-surface-500 font-bold">
                        <th className="px-4 py-2.5 w-1/3">Key</th>
                        <th className="px-4 py-2.5 w-2/5">Value</th>
                        <th className="px-4 py-2.5 text-center w-16">Secret</th>
                        <th className="px-4 py-2.5 text-center w-16">Enabled</th>
                        <th className="px-4 py-2.5 text-right w-16">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-800/60">
                      {activeEnvironmentDetail.variables.map((variable) => (
                        <tr key={variable.id} className="hover:bg-surface-800/20 text-surface-300">
                          {/* Key input cell */}
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={variable.key}
                              onChange={(e) =>
                                updateVariable(activeEnvironmentDetail.id, variable.id, {
                                  key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
                                })
                              }
                              className="bg-transparent outline-none w-full text-xs font-mono font-semibold focus:border-brand-500/30 border border-transparent rounded px-1 text-surface-200"
                            />
                          </td>
                          {/* Value input cell */}
                          <td className="px-4 py-2 relative">
                            {variable.isSecret && !revealSecrets[variable.id] ? (
                              <div className="flex items-center justify-between w-full">
                                <span className="font-mono text-surface-500 py-1">••••••••••••</span>
                                <button
                                  type="button"
                                  onClick={() => toggleSecretReveal(variable.id)}
                                  className="text-[10px] text-brand-400 hover:text-brand-300 font-semibold px-2 py-0.5 border border-brand-500/20 hover:border-brand-500/30 rounded"
                                >
                                  Reveal
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 w-full">
                                <input
                                  type="text"
                                  value={variable.value}
                                  placeholder={variable.isSecret ? 'Enter new secret value' : 'Value'}
                                  onChange={(e) =>
                                    updateVariable(activeEnvironmentDetail.id, variable.id, {
                                      value: e.target.value,
                                    })
                                  }
                                  className="bg-transparent outline-none flex-1 text-xs font-mono focus:border-brand-500/30 border border-transparent rounded px-1"
                                />
                                {variable.isSecret && (
                                  <button
                                    type="button"
                                    onClick={() => toggleSecretReveal(variable.id)}
                                    className="text-[10px] text-surface-400 hover:text-surface-200 font-semibold px-2 py-0.5 border border-surface-800 rounded"
                                  >
                                    Mask
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          {/* Secret toggle */}
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={variable.isSecret}
                              onChange={(e) =>
                                updateVariable(activeEnvironmentDetail.id, variable.id, {
                                  isSecret: e.target.checked,
                                })
                              }
                              className="accent-brand-500 h-3.5 w-3.5 cursor-pointer"
                            />
                          </td>
                          {/* Enabled checkbox */}
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={variable.enabled}
                              onChange={(e) =>
                                updateVariable(activeEnvironmentDetail.id, variable.id, {
                                  enabled: e.target.checked,
                                })
                              }
                              className="accent-brand-500 h-3.5 w-3.5 cursor-pointer"
                            />
                          </td>
                          {/* Delete variable */}
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => deleteVariable(activeEnvironmentDetail.id, variable.id)}
                              className="text-surface-500 hover:text-red-400 font-bold px-1.5"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Add New Variable Row */}
                      <tr className="bg-surface-950/30">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder="NEW_VARIABLE"
                            value={newVarKey}
                            onChange={(e) => setNewVarKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                            className="bg-transparent border border-surface-800 focus:border-brand-500 rounded px-2 py-1 text-xs w-full outline-none font-mono font-semibold placeholder-surface-700"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder="value"
                            value={newVarValue}
                            onChange={(e) => setNewVarValue(e.target.value)}
                            className="bg-transparent border border-surface-800 focus:border-brand-500 rounded px-2 py-1 text-xs w-full outline-none font-mono placeholder-surface-700"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={newVarIsSecret}
                            onChange={(e) => setNewVarIsSecret(e.target.checked)}
                            className="accent-brand-500 h-3.5 w-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] text-surface-500 font-semibold select-none">✓</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={handleAddVar}
                            disabled={!newVarKey.trim()}
                            className="text-xs text-brand-400 hover:text-brand-300 font-bold border border-brand-500/20 hover:border-brand-500/30 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            + Add
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                <svg className="w-10 h-10 text-surface-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <p className="text-xs text-surface-500">Create or select an environment to manage variables.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-surface-800 bg-surface-950/20 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-surface-100 font-bold text-xs rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
