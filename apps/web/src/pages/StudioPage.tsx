import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.js';
import { RequestBuilder } from '../components/request-builder/RequestBuilder.js';
import { ResponseViewer } from '../components/response-viewer/ResponseViewer.js';
import { CollectionSidebar } from '../components/sidebar/CollectionSidebar.js';
import { RequestTabBar } from '../components/request-builder/RequestTabBar.js';
import { useRequestTabsStore } from '../store/request-tabs-store.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';

import { EnvironmentSelector } from '../components/environments/EnvironmentSelector.js';
import { EnvironmentModal } from '../components/environments/EnvironmentModal.js';
import { useWorkspaceStore } from '../store/workspace-store.js';
import { WorkspaceSelector } from '../components/workspaces/WorkspaceSelector.js';
import { WorkspaceModal } from '../components/workspaces/WorkspaceModal.js';
import { WorkspaceSettingsModal } from '../components/workspaces/WorkspaceSettingsModal.js';

export function StudioPage() {
  const { user, logout } = useAuthStore();
  const { activeWorkspaceId, initialize } = useWorkspaceStore();
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const openNewRequest = useRequestTabsStore((s) => s.openNewRequest);

  useKeyboardShortcuts(activeWorkspaceId);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!activeWorkspaceId) return;

    const initWorkspaceTabs = () => {
      const state = useRequestTabsStore.getState();
      const workspaceTabs = state.tabs.filter((t) => t.workspaceId === activeWorkspaceId);
      if (workspaceTabs.length === 0) {
        openNewRequest(activeWorkspaceId);
      } else {
        const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
        if (activeTab && activeTab.workspaceId === activeWorkspaceId) {
          useRequestTabsStore.getState().activateTab(activeTab.id);
        } else {
          const firstTab = workspaceTabs[0];
          if (firstTab) useRequestTabsStore.getState().activateTab(firstTab.id);
        }
      }
    };

    // Wait for Zustand persist hydration before reading tab state
    if (useRequestTabsStore.persist.hasHydrated()) {
      initWorkspaceTabs();
    } else {
      const unsub = useRequestTabsStore.persist.onFinishHydration(() => {
        initWorkspaceTabs();
        unsub();
      });
      return () => unsub();
    }
  }, [activeWorkspaceId, openNewRequest]);

  return (
    <div className="flex flex-col min-h-screen bg-surface-950 text-surface-100 font-sans relative overflow-hidden select-none">
      {/* Subtle ambient light sources for premium dark theme */}
      <div className="absolute top-[-30%] left-[10%] w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[10%] w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="border-b border-surface-900/80 bg-surface-950/65 backdrop-blur-xl sticky top-0 z-50 transition-all shrink-0">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Branding Logo Icon */}
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-black text-surface-950 text-sm shadow-glow-brand tracking-tighter select-none">
              NV
            </div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400 bg-clip-text text-transparent select-none">
              NUVRO
            </h1>
            <div className="flex items-center gap-2 border-l border-surface-800/80 pl-3">
              <WorkspaceSelector onCreateWorkspaceClick={() => setIsWorkspaceModalOpen(true)} />
              {activeWorkspaceId && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-surface-900/60 hover:bg-surface-800 border border-surface-800/80 text-surface-400 hover:text-surface-100 transition-all active:scale-[0.98] outline-none focus:border-brand-500/50"
                    data-testid="workspace-settings-btn"
                    aria-label="Workspace settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a7.72 7.72 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <EnvironmentSelector
                    workspaceId={activeWorkspaceId}
                    onManageClick={() => setIsEnvModalOpen(true)}
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Details */}
            <div
              data-testid="authenticated-user"
              className="text-right text-[10px] font-bold text-surface-450 uppercase tracking-widest"
            >
              Logged in as{' '}
              <span className="text-xs font-bold text-surface-200 block normal-case tracking-normal mt-0.5">
                {user?.username}
              </span>
            </div>

            {/* Logout Action Button */}
            <button
              onClick={() => logout()}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-surface-900/60 hover:bg-surface-800 border border-surface-800/80 text-surface-350 hover:text-surface-100 px-3.5 py-1.5 text-xs font-bold transition-all active:scale-[0.98] outline-none focus:border-brand-500/50"
              aria-label="Logout button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Layout: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden relative z-10" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left Sidebar */}
        {activeWorkspaceId && <CollectionSidebar workspaceId={activeWorkspaceId} />}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-surface-950/20">
          <div className="max-w-5xl mx-auto space-y-6">
            <RequestTabBar />
            <RequestBuilder />
            <ResponseViewer />
          </div>
        </main>
      </div>

      {/* Footer Branding Info */}
      <footer className="border-t border-surface-900/40 py-2.5 text-center text-[10px] font-medium text-surface-500 bg-surface-950/60 relative z-20 shrink-0 uppercase tracking-widest select-none">
        &copy; {new Date().getFullYear()} NUVRO API Studio. Premium Developer Experience.
      </footer>

      {activeWorkspaceId && (
        <EnvironmentModal
          workspaceId={activeWorkspaceId}
          isOpen={isEnvModalOpen}
          onClose={() => setIsEnvModalOpen(false)}
        />
      )}

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />

      <WorkspaceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
