/* global MouseEvent, HTMLDivElement, Node */
import React, { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '../../store/workspace-store.js';

interface WorkspaceSelectorProps {
  onCreateWorkspaceClick: () => void;
}

export function WorkspaceSelector({ onCreateWorkspaceClick }: WorkspaceSelectorProps) {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = dropdownRef.current;
    function handleClickOutside(event: MouseEvent) {
      if (currentRef && !currentRef.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!activeWorkspace) return null;

  return (
    <div className="relative select-none" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg bg-surface-900/60 hover:bg-surface-800 border border-surface-800/80 text-surface-200 hover:text-surface-50 px-3.5 py-1.5 text-xs font-bold transition-all active:scale-[0.98] outline-none focus:border-brand-500/50"
        data-testid="workspace-selector-btn"
        aria-label="Workspace switcher"
      >
        <span className="max-w-[120px] truncate">{activeWorkspace.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className={`w-3 h-3 text-surface-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-1.5 w-56 rounded-xl bg-surface-900 border border-surface-800 shadow-glow-accent py-1.5 z-[60] animate-in fade-in slide-in-from-top-2 duration-150"
          data-testid="workspace-dropdown"
        >
          <div className="px-3 py-1.5 border-b border-surface-850">
            <span className="text-[10px] font-bold text-surface-450 uppercase tracking-widest block">Workspaces</span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => {
                  switchWorkspace(ws.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  ws.id === activeWorkspace.id
                    ? 'bg-surface-850/60 text-brand-400 font-extrabold'
                    : 'text-surface-300 hover:bg-surface-850 hover:text-surface-100 font-medium'
                }`}
                data-testid={`workspace-item-${ws.slug}`}
              >
                <div className="truncate pr-2">
                  <span className="block truncate">{ws.name}</span>
                  {ws.description && (
                    <span className="text-[10px] text-surface-450 block truncate font-normal mt-0.5">{ws.description}</span>
                  )}
                </div>
                {ws.id === activeWorkspace.id && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 text-brand-400 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-surface-850 mt-1.5 pt-1.5 px-1.5">
            <button
              type="button"
              onClick={() => {
                onCreateWorkspaceClick();
                setIsOpen(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-brand-400 hover:bg-brand-500 hover:text-surface-950 flex items-center gap-1.5 transition-all"
              data-testid="create-workspace-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
