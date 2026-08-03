import React, { useState } from 'react';
import { MethodSelector } from './MethodSelector.js';
import { RequestUrlBar } from './RequestUrlBar.js';
import { SendButton } from './SendButton.js';
import { RequestTabs } from './RequestTabs.js';
import { ParamsEditor } from './ParamsEditor.js';
import { AuthorizationEditor } from './AuthorizationEditor.js';
import { HeadersEditor } from './HeadersEditor.js';
import { BodyEditor } from './BodyEditor.js';
import { useRequestStore } from '../../store/request-store.js';
import { useCollectionStore } from '../../store/collection-store.js';
import { useEnvironmentStore } from '../../store/environment-store.js';

export function RequestBuilder() {
  const { activeTab, sendRequest, method, url, headers, queryParams, authType, authConfig, bodyType, bodyContent } = useRequestStore();
  const {
    activeRequest,
    collections,
    isSaving,
    isDirty,
    updateRequest,
    createRequest,
  } = useCollectionStore();

  const activeEnvDetail = useEnvironmentStore((s) => s.activeEnvironmentDetail);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveData, setSaveData] = useState<{
    name: string;
    collectionId: string;
    folderId: string | null;
  }>({ name: 'New Request', collectionId: '', folderId: null });

  const getResolvedUrlPreview = () => {
    if (!url.includes('{{')) return null;
    let resolved = url;
    const vars = activeEnvDetail?.variables || [];
    const varMap: Record<string, string> = {};
    for (const v of vars) {
      if (v.enabled) {
        varMap[v.key] = v.isSecret ? '••••••••••••' : v.value;
      }
    }
    
    // Replace tokens
    resolved = resolved.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
      const trimmed = key.trim();
      return varMap[trimmed] !== undefined ? varMap[trimmed] : match;
    });
    
    return resolved;
  };

  const dirty = isDirty();

  const handleSave = async () => {
    if (activeRequest) {
      // Update existing
      await updateRequest(activeRequest.id, {
        method,
        url,
        headers: headers.filter(h => h.key.trim()) as Array<{ key: string; value: string; enabled: boolean }>,
        queryParams: queryParams.filter(p => p.key.trim()) as Array<{ key: string; value: string; enabled: boolean }>,
        authType,
        authConfig: authConfig as Record<string, unknown>,
        bodyType,
        bodyContent: bodyContent || null,
      });
    } else {
      // First save — open dialog
      if (collections.length === 0) {
        window.alert('Create a collection first before saving a request.');
        return;
      }
      setSaveData({ name: 'New Request', collectionId: collections[0]?.id ?? '', folderId: null });
      setShowSaveDialog(true);
    }
  };

  const handleSaveNew = async () => {
    if (!saveData.name.trim() || !saveData.collectionId) return;
    await createRequest(
      saveData.collectionId,
      saveData.name.trim(),
      method,
      url,
      saveData.folderId,
    );
    setShowSaveDialog(false);
  };

  const renderActiveEditor = () => {
    switch (activeTab) {
      case 'params':
        return <ParamsEditor />;
      case 'auth':
        return <AuthorizationEditor />;
      case 'headers':
        return <HeadersEditor />;
      case 'body':
        return <BodyEditor />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 md:p-6 shadow-xl space-y-6">
      {/* URL Input Bar */}
      <div className="flex items-center gap-0">
        <MethodSelector />
        <RequestUrlBar onSend={sendRequest} />
        <div className="ml-3 flex items-center gap-2">
          <SendButton onSend={sendRequest} />

          {/* Save Button */}
          <button
            type="button"
            id="save-request-btn"
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-r-xl text-xs font-bold transition-all border ${
              dirty && activeRequest
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-surface-800 border-surface-700 text-surface-300 hover:bg-surface-700 hover:text-surface-100'
            } disabled:opacity-50`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 3.75 3.75 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            {isSaving ? 'Saving...' : (dirty && activeRequest ? 'Save *' : 'Save')}
          </button>
        </div>
      </div>

      {/* Resolved URL Preview */}
      {(() => {
        const preview = getResolvedUrlPreview();
        return preview ? (
          <div className="text-[11px] text-surface-500 font-mono -mt-4 bg-surface-950/45 px-3.5 py-2 rounded-lg border border-surface-800/40 truncate">
            <span className="text-brand-400/80 font-bold select-none mr-2 uppercase tracking-wide">Resolved URL Preview:</span>
            <span className="text-surface-300">{preview}</span>
          </div>
        ) : null;
      })()}

      {/* Active Request Context Badge */}
      {activeRequest && (
        <div className="flex items-center gap-2 -mt-3">
          <div className="flex items-center gap-1.5 bg-surface-800/60 border border-surface-800 rounded-lg px-2.5 py-1">
            <svg className="w-3 h-3 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </svg>
            <span className="text-xs text-surface-300 font-medium">
              {activeRequest.name}
              {dirty && <span className="text-amber-400 ml-1 font-bold">*</span>}
            </span>
          </div>
          {dirty && (
            <span className="text-xs text-amber-400/80 font-medium">Unsaved changes</span>
          )}
        </div>
      )}

      {/* Tabs Menu */}
      <RequestTabs />

      {/* Active Tab Panel */}
      <div className="bg-surface-950/40 border border-surface-800/40 rounded-xl p-4 min-h-[300px]">
        {renderActiveEditor()}
      </div>

      {/* Save New Request Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <h3 className="text-base font-bold text-surface-100 mb-4">Save Request</h3>

            <label className="block text-xs font-semibold text-surface-400 mb-1.5">Request Name</label>
            <input
              autoFocus
              value={saveData.name}
              onChange={(e) => setSaveData((d) => ({ ...d, name: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNew(); if (e.key === 'Escape') setShowSaveDialog(false); }}
              placeholder="e.g. Get Users"
              className="w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-3"
            />

            <label className="block text-xs font-semibold text-surface-400 mb-1.5">Collection</label>
            <select
              value={saveData.collectionId}
              onChange={(e) => setSaveData((d) => ({ ...d, collectionId: e.target.value, folderId: null }))}
              className="w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-3"
            >
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {saveData.collectionId && (
              <>
                <label className="block text-xs font-semibold text-surface-400 mb-1.5">
                  Folder <span className="font-normal text-surface-600">(optional)</span>
                </label>
                <select
                  value={saveData.folderId ?? ''}
                  onChange={(e) => setSaveData((d) => ({ ...d, folderId: e.target.value || null }))}
                  className="w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-4"
                >
                  <option value="">None (root)</option>
                  {(collections.find(c => c.id === saveData.collectionId)?.folders ?? []).map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="text-xs px-4 py-2 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-200"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="text-xs px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold disabled:opacity-50 transition-all"
                disabled={!saveData.name.trim() || !saveData.collectionId || isSaving}
                onClick={handleSaveNew}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
