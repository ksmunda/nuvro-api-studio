import React, { useState, useRef, useEffect } from 'react';
import type { CollectionDetail, FolderDto, ApiRequest } from '@nuvro/types';
import { useCollectionStore } from '../../store/collection-store.js';
import { useHistoryStore } from '../../store/history-store.js';
import { useRequestTabsStore, checkTabDirty } from '../../store/request-tabs-store.js';

interface ContextMenuState {
  type: 'collection' | 'folder' | 'request';
  id: string;
  extra?: Record<string, unknown>;
  x: number;
  y: number;
}

/** Inline editable name cell */
function InlineEdit({
  value,
  onSave,
  onCancel,
}: {
  value: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const submit = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      onCancel();
    }
  };

  return (
    <input
      ref={ref}
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={submit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') submit();
        if (e.key === 'Escape') onCancel();
      }}
      className="w-full text-xs bg-surface-800 border border-brand-500 text-surface-100 rounded px-1 py-0.5 outline-none"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

/** Tiny helper for HTTP method color badges */
function MethodBadge({ method }: { method: string }) {
  const colorMap: Record<string, string> = {
    GET: 'text-emerald-400',
    POST: 'text-amber-400',
    PUT: 'text-blue-400',
    PATCH: 'text-purple-400',
    DELETE: 'text-red-400',
    HEAD: 'text-teal-400',
    OPTIONS: 'text-pink-400',
    TRACE: 'text-orange-400',
    CONNECT: 'text-rose-400',
  };
  return (
    <span className={`text-[10px] font-bold uppercase shrink-0 ${colorMap[method] ?? 'text-surface-400'}`}>
      {method.slice(0, 3)}
    </span>
  );
}

/** Single saved request row */
function RequestRow({
  request,
  isActive,
  onSelect,
  onRightClick,
  isDirty,
}: {
  request: ApiRequest;
  isActive: boolean;
  onSelect: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  isDirty: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onContextMenu={onRightClick}
      className={`group w-full text-left flex items-center gap-1.5 pl-6 pr-2 py-1.5 rounded transition-colors ${
        isActive
          ? 'bg-brand-500/15 text-surface-100'
          : 'hover:bg-surface-800/60 text-surface-400 hover:text-surface-200'
      }`}
    >
      <MethodBadge method={request.method} />
      <span className="flex-1 text-xs truncate">
        {request.name}
        {isDirty && <span className="text-amber-400 ml-0.5">*</span>}
      </span>
    </button>
  );
}


function FolderSection({
  folder,
  requests,
  activeRequestId,
  onSelectRequest,
  onRightClick,
  isDirty,
}: {
  folder: FolderDto;
  requests: ApiRequest[];
  activeRequestId: string | null;
  onSelectRequest: (req: ApiRequest) => void;
  onRightClick: (e: React.MouseEvent, type: 'folder', id: string) => void;
  isDirty: boolean;
}) {
  const [open, setOpen] = useState(true);
  const { updateFolder } = useCollectionStore();
  const [editing, setEditing] = useState(false);

  const folderRequests = requests.filter((r) => r.folderId === folder.id);

  return (
    <div>
      <button
        type="button"
        onContextMenu={(e) => onRightClick(e, 'folder', folder.id)}
        className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-surface-400 hover:text-surface-200 hover:bg-surface-800/40 rounded transition-colors group"
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          className={`w-3 h-3 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M4 6l4 4 4-4z" />
        </svg>
        {editing ? (
          <InlineEdit
            value={folder.name}
            onSave={(name) => {
              updateFolder(folder.id, name);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <span className="flex-1 text-left truncate">{folder.name}</span>
        )}
      </button>
      {open && (
        <div className="ml-2 border-l border-surface-800/60 pl-1">
          {folderRequests.length === 0 ? (
            <p className="pl-4 py-1.5 text-xs text-surface-600 italic">No requests</p>
          ) : (
            folderRequests.map((r) => (
              <RequestRow
                key={r.id}
                request={r}
                isActive={r.id === activeRequestId}
                onSelect={() => onSelectRequest(r)}
                isDirty={r.id === activeRequestId && isDirty}
                onRightClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRightClick(e, 'folder', r.id);
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** Collection group (header + folders + root-level requests) */
function CollectionSection({
  collection,
  activeRequestId,
  onSelectRequest,
  setContextMenu,
  onAddFolder,
  isDirty,
}: {
  collection: CollectionDetail;
  activeRequestId: string | null;
  onSelectRequest: (req: ApiRequest) => void;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState | null>>;
  onAddFolder: (collectionId: string) => void;
  isDirty: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const { updateCollection } = useCollectionStore();

  const rootRequests = collection.requests?.filter((r) => !r.folderId) ?? [];

  return (
    <div className="mb-1">
      {/* Collection Header */}
      <button
        type="button"
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ type: 'collection', id: collection.id, x: e.clientX, y: e.clientY });
        }}
        className="group w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-bold text-surface-300 hover:bg-surface-800/60 hover:text-surface-100 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M4 6l4 4 4-4z" />
        </svg>
        {/* Folder icon */}
        <svg className="w-3.5 h-3.5 shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v8.25" />
        </svg>
        {editing ? (
          <InlineEdit
            value={collection.name}
            onSave={(name) => { updateCollection(collection.id, name); setEditing(false); }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <span className="flex-1 text-left truncate">{collection.name}</span>
        )}
        <span className="text-[10px] font-normal text-surface-600 shrink-0">
          {collection.requests?.length ?? 0}
        </span>
        {/* Quick add folder button (visible on hover) */}
        <button
          type="button"
          className="hidden group-hover:flex items-center justify-center w-4 h-4 text-surface-500 hover:text-brand-400 shrink-0 transition-colors"
          title="Add folder"
          onClick={(e) => { e.stopPropagation(); onAddFolder(collection.id); }}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path d="M8 3a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3z" />
          </svg>
        </button>
      </button>

      {/* Children */}
      {open && (
        <div className="ml-1">
          {/* Folders */}
          {collection.folders?.map((folder) => (
            <FolderSection
              key={folder.id}
              folder={folder}
              requests={collection.requests ?? []}
              activeRequestId={activeRequestId}
              onSelectRequest={onSelectRequest}
              isDirty={isDirty}
              onRightClick={(e, _type, id) => {
                e.preventDefault();
                setContextMenu({ type: 'folder', id, extra: { collectionId: collection.id }, x: e.clientX, y: e.clientY });
              }}
            />
          ))}

          {/* Root-level requests (no folder) */}
          {rootRequests.map((r) => (
            <RequestRow
              key={r.id}
              request={r}
              isActive={r.id === activeRequestId}
              onSelect={() => onSelectRequest(r)}
              isDirty={r.id === activeRequestId && isDirty}
              onRightClick={(e) => {
                e.preventDefault();
                setContextMenu({ type: 'request', id: r.id, extra: { collectionId: collection.id }, x: e.clientX, y: e.clientY });
              }}
            />
          ))}

          {/* Empty state */}
          {rootRequests.length === 0 && collection.folders?.length === 0 && (
            <p className="pl-4 py-2 text-xs text-surface-600 italic">No requests yet</p>
          )}
        </div>
      )}
    </div>
  );
}

export function CollectionSidebar({ workspaceId }: { workspaceId: string }) {
  const {
    collections,
    activeRequest,
    isLoading,
    isSaving,
    error,
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    createFolder,
    deleteFolder,
    createRequest,
    deleteRequest,
    duplicateRequest,
  } = useCollectionStore();

  const activeTabId = useRequestTabsStore((s) => s.activeTabId);
  const activeTabObj = useRequestTabsStore((s) => s.tabs.find((t) => t.id === activeTabId));
  const currentIsDirty = activeTabObj ? checkTabDirty(activeTabObj) : false;

  const {
    history,
    isLoading: isHistoryLoading,
    loadHistory,
    clearHistory,
    deleteHistoryItem,
    selectHistoryItem,
  } = useHistoryStore();

  const [activeSidebarTab, setActiveSidebarTab] = useState<'collections' | 'history'>('collections');

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDialogData, setSaveDialogData] = useState<{
    name: string;
    collectionId: string;
    folderId: string | null;
  }>({ name: 'New Request', collectionId: '', folderId: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string; extra?: Record<string, unknown> } | null>(null);

  const menuRef = useRef<globalThis.HTMLDivElement>(null);

  // Load collections on mount / workspaceId change
  useEffect(() => {
    if (workspaceId) {
      loadCollections(workspaceId);
    }
  }, [workspaceId, loadCollections]);

  // Load history when tab is clicked
  useEffect(() => {
    if (activeSidebarTab === 'history') {
      loadHistory();
    }
  }, [activeSidebarTab, loadHistory]);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectRequest = (req: ApiRequest) => {
    useRequestTabsStore.getState().openSavedRequest(req, workspaceId);
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const handleSelectHistoryItem = (item: any) => {
    useRequestTabsStore.getState().openNewRequest(workspaceId);
    selectHistoryItem(item);
  };

  const handleAddFolder = async (collectionId: string) => {
    const name = window.prompt('Folder name:');
    if (!name?.trim()) return;
    await createFolder(collectionId, name.trim());
  };

  // Context menu actions
  const handleContextAction = async (action: string) => {
    if (!contextMenu) return;
    const { type, id, extra } = contextMenu;
    setContextMenu(null);

    if (action === 'rename' && type === 'collection') {
      // We'll handle inline rename by re-rendering with editing flag
      // For simplicity here use prompt
      const name = window.prompt('New collection name:', collections.find(c => c.id === id)?.name ?? '');
      if (name?.trim()) await updateCollection(id, name.trim());
    } else if (action === 'delete' && type === 'collection') {
      const col = collections.find(c => c.id === id);
      const reqCount = col?.requests?.length ?? 0;
      const folderCount = col?.folders?.length ?? 0;
      setDeleteConfirm({
        type: 'collection',
        id,
        name: col?.name ?? 'Collection',
        extra: { reqCount, folderCount }
      });
    } else if (action === 'add-request' && type === 'collection') {
      setSaveDialogData({ name: 'New Request', collectionId: id, folderId: null });
      setShowSaveDialog(true);
    } else if (action === 'delete' && type === 'folder') {
      setDeleteConfirm({ type: 'folder', id, name: 'folder', extra: extra as Record<string, unknown> });
    } else if (action === 'delete' && type === 'request') {
      setDeleteConfirm({ type: 'request', id, name: 'request', extra: extra as Record<string, unknown> });
    } else if (action === 'duplicate' && type === 'request') {
      const col = collections.find(c => c.id === extra?.['collectionId']);
      const req = col?.requests?.find((r: ApiRequest) => r.id === id);
      if (req) await duplicateRequest(req);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    setDeleteConfirm(null);
    if (type === 'collection') await deleteCollection(id);
    else if (type === 'folder') await deleteFolder(id);
    else if (type === 'request') await deleteRequest(id);
  };

  const handleNewCollection = async () => {
    if (!newCollectionName.trim()) return;
    await createCollection(newCollectionName.trim(), workspaceId);
    setNewCollectionName('');
    setShowNewCollectionModal(false);
  };

  const handleSaveNewRequest = async () => {
    if (!saveDialogData.name.trim() || !saveDialogData.collectionId) return;
    const req = await createRequest(
      saveDialogData.collectionId,
      saveDialogData.name.trim(),
      'GET',
      '',
      saveDialogData.folderId,
    );
    useRequestTabsStore.getState().openSavedRequest(req, workspaceId);
    setShowSaveDialog(false);
  };

  return (
    <aside className="w-64 min-w-[220px] max-w-[280px] bg-surface-950 border-r border-surface-800/60 flex flex-col h-full overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-surface-800/60 shrink-0">
        <button
          type="button"
          onClick={() => setActiveSidebarTab('collections')}
          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-widest transition-all ${
            activeSidebarTab === 'collections'
              ? 'text-brand-400 border-b-2 border-brand-500 bg-surface-900/40'
              : 'text-surface-500 hover:text-surface-300'
          }`}
        >
          Collections
        </button>
        <button
          type="button"
          onClick={() => setActiveSidebarTab('history')}
          className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-widest transition-all ${
            activeSidebarTab === 'history'
              ? 'text-brand-400 border-b-2 border-brand-500 bg-surface-900/40'
              : 'text-surface-500 hover:text-surface-300'
          }`}
        >
          History
        </button>
      </div>

      {activeSidebarTab === 'collections' ? (
        <>
          {/* Header */}
          <div className="px-3 py-3 border-b border-surface-800/60 flex items-center justify-between shrink-0">
            <h2 className="text-xs font-bold text-surface-400 uppercase tracking-widest">Collections</h2>
            <button
              type="button"
              title="New Collection"
              onClick={() => setShowNewCollectionModal(true)}
              className="flex items-center justify-center w-6 h-6 rounded text-surface-500 hover:text-brand-400 hover:bg-surface-800 transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M8 3a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3z" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
            )}

            {!isLoading && error && (
              <div className="px-3 py-4 text-xs text-red-400 text-center">
                <p className="font-semibold mb-1">Unable to load collections</p>
                <button
                  type="button"
                  onClick={() => loadCollections(workspaceId)}
                  className="text-brand-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !error && collections.length === 0 && (
              <div className="px-3 py-6 text-center">
                <div className="flex justify-center mb-3">
                  <svg className="w-8 h-8 text-surface-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v8.25" />
                  </svg>
                </div>
                <p className="text-xs text-surface-500 mb-3">No collections yet.</p>
                <p className="text-xs text-surface-600 mb-3">Create your first collection to organize your API requests.</p>
                <button
                  type="button"
                  onClick={() => setShowNewCollectionModal(true)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold border border-brand-500/30 px-3 py-1.5 rounded-lg hover:bg-brand-500/10 transition-all"
                >
                  + Create Collection
                </button>
              </div>
            )}

            {!isLoading && collections.map((col) => (
              <CollectionSection
                key={col.id}
                collection={col}
                activeRequestId={activeRequest?.id ?? null}
                onSelectRequest={handleSelectRequest}
                setContextMenu={setContextMenu}
                onAddFolder={handleAddFolder}
                isDirty={currentIsDirty}
              />
            ))}
          </div>

          {/* Footer: New Request button */}
          {collections.length > 0 && (
            <div className="px-2 py-2 border-t border-surface-800/60 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSaveDialogData({ name: 'New Request', collectionId: collections[0]?.id ?? '', folderId: null });
                  setShowSaveDialog(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-surface-400 hover:text-brand-400 hover:bg-surface-800/60 border border-dashed border-surface-800 hover:border-brand-500/30 transition-all"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M8 3a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3z" />
                </svg>
                New Request
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* History Header Action */}
          <div className="px-3 py-3 border-b border-surface-800/60 flex items-center justify-between shrink-0">
            <h2 className="text-xs font-bold text-surface-400 uppercase tracking-widest">Recent Requests</h2>
            {history.length > 0 && (
              <button
                type="button"
                id="clear-history-btn"
                onClick={clearHistory}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* History Content */}
          <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-1">
            {isHistoryLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
            )}

            {!isHistoryLoading && history.length === 0 && (
              <p className="text-xs text-surface-600 italic text-center py-8">No request history yet</p>
            )}

            {!isHistoryLoading && history.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg hover:bg-surface-800/40 transition-all cursor-pointer relative"
                onClick={() => handleSelectHistoryItem(item)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MethodBadge method={item.method} />
                  <span className={`text-[10px] font-bold ${
                    item.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-450'
                  }`}>
                    {item.statusCode || item.status}
                  </span>
                  <span className="text-xs text-surface-300 truncate font-mono">
                    {item.url}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.durationMs && (
                    <span className="text-[10px] text-surface-600">{item.durationMs}ms</span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                    className="text-surface-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
          className="bg-surface-900 border border-surface-700 rounded-xl shadow-2xl py-1 min-w-36 text-xs"
        >
          {contextMenu.type === 'collection' && (
            <>
              <button type="button" className="w-full text-left px-3 py-2 hover:bg-surface-800 text-surface-300" onClick={() => handleContextAction('add-request')}>+ Add Request</button>
              <button type="button" className="w-full text-left px-3 py-2 hover:bg-surface-800 text-surface-300" onClick={() => { setContextMenu(null); handleAddFolder(contextMenu.id); }}>+ Add Folder</button>
              <div className="border-t border-surface-800 my-1" />
              <button type="button" className="w-full text-left px-3 py-2 hover:bg-surface-800 text-surface-300" onClick={() => handleContextAction('rename')}>Rename</button>
              <button type="button" className="w-full text-left px-3 py-2 hover:bg-surface-800 text-red-400" onClick={() => handleContextAction('delete')}>Delete</button>
            </>
          )}
          {contextMenu.type === 'folder' && (
            <>
              <button type="button" className="w-full text-left px-3 py-2 hover:bg-surface-800 text-surface-300" onClick={() => handleContextAction('rename')}>Rename</button>
              <button type="button" className="w-full text-left px-3 py-2 hover:bg-surface-800 text-red-400" onClick={() => handleContextAction('delete')}>Delete</button>
            </>
          )}
          {contextMenu.type === 'request' && (
            <>
              <button type="button" className="w-full text-left px-3 py-2 hover:bg-surface-800 text-surface-300" onClick={() => handleContextAction('duplicate')}>Duplicate</button>
              <div className="border-t border-surface-800 my-1" />
              <button type="button" className="w-full text-left px-3 py-2 hover:bg-surface-800 text-red-400" onClick={() => handleContextAction('delete')}>Delete</button>
            </>
          )}
        </div>
      )}

      {/* New Collection Modal */}
      {showNewCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <h3 className="text-base font-bold text-surface-100 mb-4">New Collection</h3>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5">Collection Name</label>
            <input
              autoFocus
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNewCollection(); if (e.key === 'Escape') { setShowNewCollectionModal(false); setNewCollectionName(''); } }}
              placeholder="e.g. Users API"
              className="w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" className="text-xs px-4 py-2 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-200" onClick={() => { setShowNewCollectionModal(false); setNewCollectionName(''); }}>Cancel</button>
              <button type="button" className="text-xs px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold disabled:opacity-50 transition-all" disabled={!newCollectionName.trim() || isSaving} onClick={handleNewCollection}>{isSaving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Save / New Request Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <h3 className="text-base font-bold text-surface-100 mb-4">New Request</h3>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5">Request Name</label>
            <input
              autoFocus
              value={saveDialogData.name}
              onChange={(e) => setSaveDialogData((d) => ({ ...d, name: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNewRequest(); if (e.key === 'Escape') setShowSaveDialog(false); }}
              placeholder="e.g. Get Users"
              className="w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-3"
            />
            <label className="block text-xs font-semibold text-surface-400 mb-1.5">Collection</label>
            <select
              value={saveDialogData.collectionId}
              onChange={(e) => setSaveDialogData((d) => ({ ...d, collectionId: e.target.value, folderId: null }))}
              className="w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-3"
            >
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {saveDialogData.collectionId && (
              <>
                <label className="block text-xs font-semibold text-surface-400 mb-1.5">Folder <span className="font-normal text-surface-600">(optional)</span></label>
                <select
                  value={saveDialogData.folderId ?? ''}
                  onChange={(e) => setSaveDialogData((d) => ({ ...d, folderId: e.target.value || null }))}
                  className="w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-4"
                >
                  <option value="">None (root)</option>
                  {(collections.find(c => c.id === saveDialogData.collectionId)?.folders ?? []).map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </>
            )}
            <div className="flex gap-2 justify-end">
              <button type="button" className="text-xs px-4 py-2 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-200" onClick={() => setShowSaveDialog(false)}>Cancel</button>
              <button type="button" className="text-xs px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold disabled:opacity-50 transition-all" disabled={!saveDialogData.name.trim() || !saveDialogData.collectionId || isSaving} onClick={handleSaveNewRequest}>{isSaving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <h3 className="text-base font-bold text-surface-100">Delete "{deleteConfirm.name}"?</h3>
            </div>
            <p className="text-xs text-surface-400 mb-2">This action is permanent and cannot be undone.</p>
            {deleteConfirm.type === 'collection' && (() => {
              const extra = deleteConfirm.extra as { folderCount?: number; reqCount?: number } | undefined;
              return extra ? (
                <div className="text-xs text-surface-500 mb-4 bg-red-500/5 border border-red-500/10 rounded-lg p-3 space-y-1">
                  <p>This will permanently delete:</p>
                  <p>• 1 collection</p>
                  {(extra.folderCount ?? 0) > 0 && <p>• {extra.folderCount} folder{(extra.folderCount ?? 0) !== 1 ? 's' : ''}</p>}
                  {(extra.reqCount ?? 0) > 0 && <p>• {extra.reqCount} saved request{(extra.reqCount ?? 0) !== 1 ? 's' : ''}</p>}
                </div>
              ) : null;
            })()}
            <div className="flex gap-2 justify-end">
              <button type="button" className="text-xs px-4 py-2 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-200" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button type="button" className="text-xs px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-all" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
