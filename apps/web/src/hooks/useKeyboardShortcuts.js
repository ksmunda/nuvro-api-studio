import { useEffect } from 'react';
import { useRequestTabsStore, checkTabDirty } from '../store/request-tabs-store.js';
import { useRequestStore } from '../store/request-store.js';
export function useKeyboardShortcuts(workspaceId) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if typing in an input, textarea, or contenteditable
            // Exception: Cmd/Ctrl+Enter should still work inside inputs (e.g. body editor)
            const target = e.target;
            const isInput = target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable;
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
            if (!cmdOrCtrl)
                return;
            const key = e.key.toLowerCase();
            // Cmd/Ctrl + Enter -> Send Request
            if (key === 'enter') {
                e.preventDefault();
                useRequestStore.getState().sendRequest();
                return;
            }
            // If we are in an input and it's not Enter, ignore other global shortcuts
            if (isInput)
                return;
            // Cmd/Ctrl + S -> Save Request
            if (key === 's') {
                e.preventDefault();
                const saveBtn = document.getElementById('save-request-btn');
                if (saveBtn && !saveBtn.disabled) {
                    saveBtn.click();
                }
                return;
            }
            // Cmd/Ctrl + Shift + T -> Reopen closed tab
            if (key === 't' && e.shiftKey) {
                e.preventDefault();
                if (workspaceId) {
                    useRequestTabsStore.getState().reopenClosedTab(workspaceId);
                }
                return;
            }
            // Cmd/Ctrl + T -> New tab
            if (key === 't' && !e.shiftKey) {
                e.preventDefault();
                const newTabBtn = document.getElementById('new-request-tab-btn');
                if (newTabBtn) {
                    newTabBtn.click();
                }
                else if (workspaceId) {
                    useRequestTabsStore.getState().openNewRequest(workspaceId);
                }
                return;
            }
            // Cmd/Ctrl + W -> Close tab
            if (key === 'w') {
                e.preventDefault();
                const state = useRequestTabsStore.getState();
                if (state.activeTabId) {
                    state.closeTab(state.activeTabId);
                }
                return;
            }
        };
        const handleTabNavigation = (e) => {
            // Ctrl + Tab / Ctrl + Shift + Tab
            if (e.ctrlKey && e.key.toLowerCase() === 'tab') {
                e.preventDefault();
                const state = useRequestTabsStore.getState();
                if (!workspaceId || state.tabs.length === 0)
                    return;
                const workspaceTabs = state.tabs.filter(t => t.workspaceId === workspaceId);
                if (workspaceTabs.length <= 1)
                    return;
                const currentIndex = workspaceTabs.findIndex(t => t.id === state.activeTabId);
                if (currentIndex === -1)
                    return;
                let nextIndex;
                if (e.shiftKey) {
                    nextIndex = (currentIndex - 1 + workspaceTabs.length) % workspaceTabs.length;
                }
                else {
                    nextIndex = (currentIndex + 1) % workspaceTabs.length;
                }
                const nextTab = workspaceTabs[nextIndex];
                if (nextTab) {
                    state.activateTab(nextTab.id);
                }
            }
        };
        const combinedHandler = (e) => {
            handleTabNavigation(e);
            handleKeyDown(e);
        };
        window.addEventListener('keydown', combinedHandler);
        return () => window.removeEventListener('keydown', combinedHandler);
    }, [workspaceId]);
    // Before unload hook
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            const state = useRequestTabsStore.getState();
            const hasDirty = state.tabs.some(checkTabDirty);
            if (hasDirty) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);
}
//# sourceMappingURL=useKeyboardShortcuts.js.map