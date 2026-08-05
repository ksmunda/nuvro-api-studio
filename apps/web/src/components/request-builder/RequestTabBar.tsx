import React, { useState, useRef, useEffect } from 'react';
import { useRequestTabsStore, checkTabDirty } from '../../store/request-tabs-store.js';
import { useWorkspaceStore } from '../../store/workspace-store.js';

export function RequestTabBar() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { tabs, activeTabId, activateTab, closeTab, closeOtherTabs, closeAllTabs, openNewRequest, duplicateTab } = useRequestTabsStore();
  const [contextMenuTabId, setContextMenuTabId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<globalThis.HTMLDivElement>(null);

  // Filter tabs by workspace
  const workspaceTabs = tabs.filter((t) => t.workspaceId === activeWorkspaceId);

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'text-emerald-400',
      POST: 'text-amber-400',
      PUT: 'text-blue-400',
      PATCH: 'text-purple-400',
      DELETE: 'text-red-400',
      HEAD: 'text-teal-400',
      OPTIONS: 'text-pink-400',
    };
    return colors[method] || 'text-surface-400';
  };

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenuTabId) return;
    const handler = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        setContextMenuTabId(null);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [contextMenuTabId]);

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuTabId(tabId);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex items-center gap-1 bg-surface-950/40 border border-surface-900 rounded-xl px-2 py-1.5 overflow-x-auto select-none no-scrollbar relative" data-testid="request-tab-bar">
      {workspaceTabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const dirty = checkTabDirty(tab);
        return (
          <div
            key={tab.id}
            onClick={() => activateTab(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            data-testid={`request-tab-${tab.id}`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all select-none shrink-0 ${
              isActive
                ? 'bg-surface-900 border-surface-700 text-surface-100 shadow-lg'
                : 'bg-transparent border-transparent text-surface-400 hover:text-surface-200 hover:bg-surface-900/40'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${getMethodColor(tab.method)}`}>
              {tab.method}
            </span>
            <span className="truncate max-w-[120px]">
              {tab.title}
            </span>
            {dirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Unsaved changes" data-testid={`dirty-indicator-${tab.id}`} />
            )}
            <button
              type="button"
              data-testid={`close-tab-${tab.id}`}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="text-surface-500 hover:text-surface-200 p-0.5 rounded transition-colors hover:bg-surface-800"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
        );
      })}

      {/* Add New Tab Button */}
      <button
        type="button"
        id="new-request-tab-btn"
        onClick={() => {
          if (activeWorkspaceId) openNewRequest(activeWorkspaceId);
        }}
        className="flex items-center justify-center p-1.5 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-900/60 border border-transparent hover:border-brand-500/20 transition-all ml-1 shrink-0"
        title="Open new request tab"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
        </svg>
      </button>

      {/* Tab Context Menu */}
      {contextMenuTabId && (
        <div
          ref={menuRef}
          data-testid="tab-context-menu"
          className="fixed z-50 bg-surface-900 border border-surface-700 rounded-lg shadow-xl py-1 text-xs min-w-[160px]"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          <button
            type="button"
            data-testid="ctx-duplicate-tab"
            onClick={() => { duplicateTab(contextMenuTabId); setContextMenuTabId(null); }}
            className="w-full text-left px-3 py-1.5 hover:bg-surface-800 text-surface-200 transition-colors"
          >
            Duplicate Tab
          </button>
          <button
            type="button"
            data-testid="ctx-close-others"
            onClick={() => { closeOtherTabs(contextMenuTabId); setContextMenuTabId(null); }}
            className="w-full text-left px-3 py-1.5 hover:bg-surface-800 text-surface-200 transition-colors"
          >
            Close Other Tabs
          </button>
          <button
            type="button"
            data-testid="ctx-close-all"
            onClick={() => { closeAllTabs(); setContextMenuTabId(null); }}
            className="w-full text-left px-3 py-1.5 hover:bg-surface-800 text-red-400 transition-colors"
          >
            Close All Tabs
          </button>
        </div>
      )}
    </div>
  );
}
