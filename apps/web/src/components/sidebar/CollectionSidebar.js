import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useCollectionStore } from '../../store/collection-store.js';
/** Inline editable name cell */
function InlineEdit({ value, onSave, onCancel, }) {
    const [name, setName] = useState(value);
    const ref = useRef(null);
    useEffect(() => {
        ref.current?.focus();
        ref.current?.select();
    }, []);
    const submit = () => {
        const trimmed = name.trim();
        if (trimmed && trimmed !== value) {
            onSave(trimmed);
        }
        else {
            onCancel();
        }
    };
    return (_jsx("input", { ref: ref, value: name, onChange: (e) => setName(e.target.value), onBlur: submit, onKeyDown: (e) => {
            if (e.key === 'Enter')
                submit();
            if (e.key === 'Escape')
                onCancel();
        }, className: "w-full text-xs bg-surface-800 border border-brand-500 text-surface-100 rounded px-1 py-0.5 outline-none", onClick: (e) => e.stopPropagation() }));
}
/** Tiny helper for HTTP method color badges */
function MethodBadge({ method }) {
    const colorMap = {
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
    return (_jsx("span", { className: `text-[10px] font-bold uppercase shrink-0 ${colorMap[method] ?? 'text-surface-400'}`, children: method.slice(0, 3) }));
}
/** Single saved request row */
function RequestRow({ request, isActive, onSelect, onRightClick, isDirty, }) {
    return (_jsxs("button", { type: "button", onClick: onSelect, onContextMenu: onRightClick, className: `group w-full text-left flex items-center gap-1.5 pl-6 pr-2 py-1.5 rounded transition-colors ${isActive
            ? 'bg-brand-500/15 text-surface-100'
            : 'hover:bg-surface-800/60 text-surface-400 hover:text-surface-200'}`, children: [_jsx(MethodBadge, { method: request.method }), _jsxs("span", { className: "flex-1 text-xs truncate", children: [request.name, isDirty && _jsx("span", { className: "text-amber-400 ml-0.5", children: "*" })] })] }));
}
function FolderSection({ folder, requests, activeRequestId, onSelectRequest, onRightClick, isDirty, }) {
    const [open, setOpen] = useState(true);
    const { updateFolder } = useCollectionStore();
    const [editing, setEditing] = useState(false);
    const folderRequests = requests.filter((r) => r.folderId === folder.id);
    return (_jsxs("div", { children: [_jsxs("button", { type: "button", onContextMenu: (e) => onRightClick(e, 'folder', folder.id), className: "w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-surface-400 hover:text-surface-200 hover:bg-surface-800/40 rounded transition-colors group", onClick: () => setOpen((o) => !o), children: [_jsx("svg", { className: `w-3 h-3 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`, viewBox: "0 0 16 16", fill: "currentColor", children: _jsx("path", { d: "M4 6l4 4 4-4z" }) }), editing ? (_jsx(InlineEdit, { value: folder.name, onSave: (name) => {
                            updateFolder(folder.id, name);
                            setEditing(false);
                        }, onCancel: () => setEditing(false) })) : (_jsx("span", { className: "flex-1 text-left truncate", children: folder.name }))] }), open && (_jsx("div", { className: "ml-2 border-l border-surface-800/60 pl-1", children: folderRequests.length === 0 ? (_jsx("p", { className: "pl-4 py-1.5 text-xs text-surface-600 italic", children: "No requests" })) : (folderRequests.map((r) => (_jsx(RequestRow, { request: r, isActive: r.id === activeRequestId, onSelect: () => onSelectRequest(r), isDirty: r.id === activeRequestId && isDirty, onRightClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRightClick(e, 'folder', r.id);
                    } }, r.id)))) }))] }));
}
/** Collection group (header + folders + root-level requests) */
function CollectionSection({ collection, activeRequestId, onSelectRequest, setContextMenu, onAddFolder, isDirty, }) {
    const [open, setOpen] = useState(true);
    const [editing, setEditing] = useState(false);
    const { updateCollection } = useCollectionStore();
    const rootRequests = collection.requests?.filter((r) => !r.folderId) ?? [];
    return (_jsxs("div", { className: "mb-1", children: [_jsxs("button", { type: "button", onContextMenu: (e) => {
                    e.preventDefault();
                    setContextMenu({ type: 'collection', id: collection.id, x: e.clientX, y: e.clientY });
                }, className: "group w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-bold text-surface-300 hover:bg-surface-800/60 hover:text-surface-100 transition-colors", onClick: () => setOpen((o) => !o), children: [_jsx("svg", { className: `w-3.5 h-3.5 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`, viewBox: "0 0 16 16", fill: "currentColor", children: _jsx("path", { d: "M4 6l4 4 4-4z" }) }), _jsx("svg", { className: "w-3.5 h-3.5 shrink-0 text-brand-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v8.25" }) }), editing ? (_jsx(InlineEdit, { value: collection.name, onSave: (name) => { updateCollection(collection.id, name); setEditing(false); }, onCancel: () => setEditing(false) })) : (_jsx("span", { className: "flex-1 text-left truncate", children: collection.name })), _jsx("span", { className: "text-[10px] font-normal text-surface-600 shrink-0", children: collection.requests?.length ?? 0 }), _jsx("button", { type: "button", className: "hidden group-hover:flex items-center justify-center w-4 h-4 text-surface-500 hover:text-brand-400 shrink-0 transition-colors", title: "Add folder", onClick: (e) => { e.stopPropagation(); onAddFolder(collection.id); }, children: _jsx("svg", { viewBox: "0 0 16 16", fill: "currentColor", className: "w-3 h-3", children: _jsx("path", { d: "M8 3a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3z" }) }) })] }), open && (_jsxs("div", { className: "ml-1", children: [collection.folders?.map((folder) => (_jsx(FolderSection, { folder: folder, requests: collection.requests ?? [], activeRequestId: activeRequestId, onSelectRequest: onSelectRequest, isDirty: isDirty, onRightClick: (e, _type, id) => {
                            e.preventDefault();
                            setContextMenu({ type: 'folder', id, extra: { collectionId: collection.id }, x: e.clientX, y: e.clientY });
                        } }, folder.id))), rootRequests.map((r) => (_jsx(RequestRow, { request: r, isActive: r.id === activeRequestId, onSelect: () => onSelectRequest(r), isDirty: r.id === activeRequestId && isDirty, onRightClick: (e) => {
                            e.preventDefault();
                            setContextMenu({ type: 'request', id: r.id, extra: { collectionId: collection.id }, x: e.clientX, y: e.clientY });
                        } }, r.id))), rootRequests.length === 0 && collection.folders?.length === 0 && (_jsx("p", { className: "pl-4 py-2 text-xs text-surface-600 italic", children: "No requests yet" }))] }))] }));
}
export function CollectionSidebar({ workspaceId }) {
    const { collections, activeRequest, isLoading, isSaving, error, loadCollections, setActiveRequest, createCollection, updateCollection, deleteCollection, createFolder, deleteFolder, createRequest, deleteRequest, duplicateRequest, isDirty, } = useCollectionStore();
    const currentIsDirty = isDirty();
    const [contextMenu, setContextMenu] = useState(null);
    const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveDialogData, setSaveDialogData] = useState({ name: 'New Request', collectionId: '', folderId: null });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const menuRef = useRef(null);
    // Load collections on mount / workspaceId change
    useEffect(() => {
        if (workspaceId) {
            loadCollections(workspaceId);
        }
    }, [workspaceId, loadCollections]);
    // Close context menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setContextMenu(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const handleSelectRequest = (req) => {
        setActiveRequest(req);
    };
    const handleAddFolder = async (collectionId) => {
        const name = window.prompt('Folder name:');
        if (!name?.trim())
            return;
        await createFolder(collectionId, name.trim());
    };
    // Context menu actions
    const handleContextAction = async (action) => {
        if (!contextMenu)
            return;
        const { type, id, extra } = contextMenu;
        setContextMenu(null);
        if (action === 'rename' && type === 'collection') {
            // We'll handle inline rename by re-rendering with editing flag
            // For simplicity here use prompt
            const name = window.prompt('New collection name:', collections.find(c => c.id === id)?.name ?? '');
            if (name?.trim())
                await updateCollection(id, name.trim());
        }
        else if (action === 'delete' && type === 'collection') {
            const col = collections.find(c => c.id === id);
            const reqCount = col?.requests?.length ?? 0;
            const folderCount = col?.folders?.length ?? 0;
            setDeleteConfirm({
                type: 'collection',
                id,
                name: col?.name ?? 'Collection',
                extra: { reqCount, folderCount }
            });
        }
        else if (action === 'add-request' && type === 'collection') {
            setSaveDialogData({ name: 'New Request', collectionId: id, folderId: null });
            setShowSaveDialog(true);
        }
        else if (action === 'delete' && type === 'folder') {
            setDeleteConfirm({ type: 'folder', id, name: 'folder', extra: extra });
        }
        else if (action === 'delete' && type === 'request') {
            setDeleteConfirm({ type: 'request', id, name: 'request', extra: extra });
        }
        else if (action === 'duplicate' && type === 'request') {
            const col = collections.find(c => c.id === extra?.['collectionId']);
            const req = col?.requests?.find((r) => r.id === id);
            if (req)
                await duplicateRequest(req);
        }
    };
    const handleDeleteConfirm = async () => {
        if (!deleteConfirm)
            return;
        const { type, id } = deleteConfirm;
        setDeleteConfirm(null);
        if (type === 'collection')
            await deleteCollection(id);
        else if (type === 'folder')
            await deleteFolder(id);
        else if (type === 'request')
            await deleteRequest(id);
    };
    const handleNewCollection = async () => {
        if (!newCollectionName.trim())
            return;
        await createCollection(newCollectionName.trim(), workspaceId);
        setNewCollectionName('');
        setShowNewCollectionModal(false);
    };
    const handleSaveNewRequest = async () => {
        if (!saveDialogData.name.trim() || !saveDialogData.collectionId)
            return;
        const req = await createRequest(saveDialogData.collectionId, saveDialogData.name.trim(), 'GET', '', saveDialogData.folderId);
        setShowSaveDialog(false);
        setActiveRequest(req);
    };
    return (_jsxs("aside", { className: "w-64 min-w-[220px] max-w-[280px] bg-surface-950 border-r border-surface-800/60 flex flex-col h-full overflow-hidden", children: [_jsxs("div", { className: "px-3 py-3 border-b border-surface-800/60 flex items-center justify-between shrink-0", children: [_jsx("h2", { className: "text-xs font-bold text-surface-400 uppercase tracking-widest", children: "Collections" }), _jsx("button", { type: "button", title: "New Collection", onClick: () => setShowNewCollectionModal(true), className: "flex items-center justify-center w-6 h-6 rounded text-surface-500 hover:text-brand-400 hover:bg-surface-800 transition-colors", children: _jsx("svg", { viewBox: "0 0 16 16", fill: "currentColor", className: "w-4 h-4", children: _jsx("path", { d: "M8 3a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3z" }) }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5", children: [isLoading && (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" }) })), !isLoading && error && (_jsxs("div", { className: "px-3 py-4 text-xs text-red-400 text-center", children: [_jsx("p", { className: "font-semibold mb-1", children: "Unable to load collections" }), _jsx("button", { type: "button", onClick: () => loadCollections(workspaceId), className: "text-brand-400 hover:underline", children: "Retry" })] })), !isLoading && !error && collections.length === 0 && (_jsxs("div", { className: "px-3 py-6 text-center", children: [_jsx("div", { className: "flex justify-center mb-3", children: _jsx("svg", { className: "w-8 h-8 text-surface-700", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v8.25" }) }) }), _jsx("p", { className: "text-xs text-surface-500 mb-3", children: "No collections yet." }), _jsx("p", { className: "text-xs text-surface-600 mb-3", children: "Create your first collection to organize your API requests." }), _jsx("button", { type: "button", onClick: () => setShowNewCollectionModal(true), className: "text-xs text-brand-400 hover:text-brand-300 font-semibold border border-brand-500/30 px-3 py-1.5 rounded-lg hover:bg-brand-500/10 transition-all", children: "+ Create Collection" })] })), !isLoading && collections.map((col) => (_jsx(CollectionSection, { collection: col, activeRequestId: activeRequest?.id ?? null, onSelectRequest: handleSelectRequest, setContextMenu: setContextMenu, onAddFolder: handleAddFolder, isDirty: currentIsDirty }, col.id)))] }), collections.length > 0 && (_jsx("div", { className: "px-2 py-2 border-t border-surface-800/60 shrink-0", children: _jsxs("button", { type: "button", onClick: () => {
                        setSaveDialogData({ name: 'New Request', collectionId: collections[0]?.id ?? '', folderId: null });
                        setShowSaveDialog(true);
                    }, className: "w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-surface-400 hover:text-brand-400 hover:bg-surface-800/60 border border-dashed border-surface-800 hover:border-brand-500/30 transition-all", children: [_jsx("svg", { viewBox: "0 0 16 16", fill: "currentColor", className: "w-3.5 h-3.5", children: _jsx("path", { d: "M8 3a.5.5 0 0 1 .5.5v4h4a.5.5 0 0 1 0 1h-4v4a.5.5 0 0 1-1 0v-4h-4a.5.5 0 0 1 0-1h4v-4A.5.5 0 0 1 8 3z" }) }), "New Request"] }) })), contextMenu && (_jsxs("div", { ref: menuRef, style: { position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }, className: "bg-surface-900 border border-surface-700 rounded-xl shadow-2xl py-1 min-w-36 text-xs", children: [contextMenu.type === 'collection' && (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: "w-full text-left px-3 py-2 hover:bg-surface-800 text-surface-300", onClick: () => handleContextAction('add-request'), children: "+ Add Request" }), _jsx("button", { type: "button", className: "w-full text-left px-3 py-2 hover:bg-surface-800 text-surface-300", onClick: () => { setContextMenu(null); handleAddFolder(contextMenu.id); }, children: "+ Add Folder" }), _jsx("div", { className: "border-t border-surface-800 my-1" }), _jsx("button", { type: "button", className: "w-full text-left px-3 py-2 hover:bg-surface-800 text-surface-300", onClick: () => handleContextAction('rename'), children: "Rename" }), _jsx("button", { type: "button", className: "w-full text-left px-3 py-2 hover:bg-surface-800 text-red-400", onClick: () => handleContextAction('delete'), children: "Delete" })] })), contextMenu.type === 'folder' && (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: "w-full text-left px-3 py-2 hover:bg-surface-800 text-surface-300", onClick: () => handleContextAction('rename'), children: "Rename" }), _jsx("button", { type: "button", className: "w-full text-left px-3 py-2 hover:bg-surface-800 text-red-400", onClick: () => handleContextAction('delete'), children: "Delete" })] })), contextMenu.type === 'request' && (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: "w-full text-left px-3 py-2 hover:bg-surface-800 text-surface-300", onClick: () => handleContextAction('duplicate'), children: "Duplicate" }), _jsx("div", { className: "border-t border-surface-800 my-1" }), _jsx("button", { type: "button", className: "w-full text-left px-3 py-2 hover:bg-surface-800 text-red-400", onClick: () => handleContextAction('delete'), children: "Delete" })] }))] })), showNewCollectionModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm", children: _jsxs("div", { className: "bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4", children: [_jsx("h3", { className: "text-base font-bold text-surface-100 mb-4", children: "New Collection" }), _jsx("label", { className: "block text-xs font-semibold text-surface-400 mb-1.5", children: "Collection Name" }), _jsx("input", { autoFocus: true, value: newCollectionName, onChange: (e) => setNewCollectionName(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter')
                                handleNewCollection(); if (e.key === 'Escape') {
                                setShowNewCollectionModal(false);
                                setNewCollectionName('');
                            } }, placeholder: "e.g. Users API", className: "w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-4" }), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx("button", { type: "button", className: "text-xs px-4 py-2 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-200", onClick: () => { setShowNewCollectionModal(false); setNewCollectionName(''); }, children: "Cancel" }), _jsx("button", { type: "button", className: "text-xs px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold disabled:opacity-50 transition-all", disabled: !newCollectionName.trim() || isSaving, onClick: handleNewCollection, children: isSaving ? 'Creating...' : 'Create' })] })] }) })), showSaveDialog && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm", children: _jsxs("div", { className: "bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4", children: [_jsx("h3", { className: "text-base font-bold text-surface-100 mb-4", children: "New Request" }), _jsx("label", { className: "block text-xs font-semibold text-surface-400 mb-1.5", children: "Request Name" }), _jsx("input", { autoFocus: true, value: saveDialogData.name, onChange: (e) => setSaveDialogData((d) => ({ ...d, name: e.target.value })), onKeyDown: (e) => { if (e.key === 'Enter')
                                handleSaveNewRequest(); if (e.key === 'Escape')
                                setShowSaveDialog(false); }, placeholder: "e.g. Get Users", className: "w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-3" }), _jsx("label", { className: "block text-xs font-semibold text-surface-400 mb-1.5", children: "Collection" }), _jsx("select", { value: saveDialogData.collectionId, onChange: (e) => setSaveDialogData((d) => ({ ...d, collectionId: e.target.value, folderId: null })), className: "w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-3", children: collections.map((c) => _jsx("option", { value: c.id, children: c.name }, c.id)) }), saveDialogData.collectionId && (_jsxs(_Fragment, { children: [_jsxs("label", { className: "block text-xs font-semibold text-surface-400 mb-1.5", children: ["Folder ", _jsx("span", { className: "font-normal text-surface-600", children: "(optional)" })] }), _jsxs("select", { value: saveDialogData.folderId ?? '', onChange: (e) => setSaveDialogData((d) => ({ ...d, folderId: e.target.value || null })), className: "w-full bg-surface-800 border border-surface-700 text-surface-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mb-4", children: [_jsx("option", { value: "", children: "None (root)" }), (collections.find(c => c.id === saveDialogData.collectionId)?.folders ?? []).map((f) => (_jsx("option", { value: f.id, children: f.name }, f.id)))] })] })), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx("button", { type: "button", className: "text-xs px-4 py-2 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-200", onClick: () => setShowSaveDialog(false), children: "Cancel" }), _jsx("button", { type: "button", className: "text-xs px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold disabled:opacity-50 transition-all", disabled: !saveDialogData.name.trim() || !saveDialogData.collectionId || isSaving, onClick: handleSaveNewRequest, children: isSaving ? 'Creating...' : 'Create' })] })] }) })), deleteConfirm && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm", children: _jsxs("div", { className: "bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("svg", { className: "w-5 h-5 text-red-400 shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" }) }), _jsxs("h3", { className: "text-base font-bold text-surface-100", children: ["Delete \"", deleteConfirm.name, "\"?"] })] }), _jsx("p", { className: "text-xs text-surface-400 mb-2", children: "This action is permanent and cannot be undone." }), deleteConfirm.type === 'collection' && (() => {
                            const extra = deleteConfirm.extra;
                            return extra ? (_jsxs("div", { className: "text-xs text-surface-500 mb-4 bg-red-500/5 border border-red-500/10 rounded-lg p-3 space-y-1", children: [_jsx("p", { children: "This will permanently delete:" }), _jsx("p", { children: "\u2022 1 collection" }), (extra.folderCount ?? 0) > 0 && _jsxs("p", { children: ["\u2022 ", extra.folderCount, " folder", (extra.folderCount ?? 0) !== 1 ? 's' : ''] }), (extra.reqCount ?? 0) > 0 && _jsxs("p", { children: ["\u2022 ", extra.reqCount, " saved request", (extra.reqCount ?? 0) !== 1 ? 's' : ''] })] })) : null;
                        })(), _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx("button", { type: "button", className: "text-xs px-4 py-2 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-200", onClick: () => setDeleteConfirm(null), children: "Cancel" }), _jsx("button", { type: "button", className: "text-xs px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-all", onClick: handleDeleteConfirm, children: "Delete" })] })] }) }))] }));
}
//# sourceMappingURL=CollectionSidebar.js.map