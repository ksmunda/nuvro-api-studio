import React, { useEffect, useState, useRef } from 'react';
import { useEnvironmentStore } from '../../store/environment-store.js';

interface EnvironmentSelectorProps {
  workspaceId: string;
  onManageClick: () => void;
}

export function EnvironmentSelector({ workspaceId, onManageClick }: EnvironmentSelectorProps) {
  const {
    environments,
    activeEnvironmentId,
    loadEnvironments,
    selectEnvironment,
  } = useEnvironmentStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<globalThis.HTMLDivElement>(null);

  useEffect(() => {
    if (workspaceId) {
      loadEnvironments(workspaceId);
    }
  }, [workspaceId, loadEnvironments]);

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as globalThis.Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeEnv = environments.find((e) => e.id === activeEnvironmentId);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        id="env-selector-btn"
        className="flex items-center gap-1.5 bg-surface-900 border border-surface-800 rounded-lg px-3 py-1.5 hover:bg-surface-800 transition-colors cursor-pointer outline-none focus:border-brand-500"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        <span className="text-xs text-surface-300 font-semibold select-none">
          {activeEnv ? activeEnv.name : 'No Environment'}
        </span>
        <svg className="w-3 h-3 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 origin-top-right rounded-lg bg-surface-900 border border-surface-800 shadow-2xl z-50 py-1 text-xs">
          <div className="px-3 py-1.5 text-[10px] font-bold text-surface-500 uppercase tracking-wider">
            Environments
          </div>
          <button
            type="button"
            onClick={async () => {
              await selectEnvironment(null, workspaceId);
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 hover:bg-surface-800 transition-colors flex items-center justify-between ${
              !activeEnvironmentId ? 'text-brand-400 font-bold bg-brand-500/5' : 'text-surface-300'
            }`}
          >
            <span>No Environment</span>
            {!activeEnvironmentId && (
              <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
          
          {environments.map((env) => (
            <button
              key={env.id}
              type="button"
              onClick={async () => {
                await selectEnvironment(env.id, workspaceId);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 hover:bg-surface-800 transition-colors flex items-center justify-between ${
                activeEnvironmentId === env.id ? 'text-brand-400 font-bold bg-brand-500/5' : 'text-surface-300'
              }`}
            >
              <span className="truncate">{env.name}</span>
              {activeEnvironmentId === env.id && (
                <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
          ))}

          <div className="border-t border-surface-800 my-1" />
          
          <button
            type="button"
            onClick={() => {
              onManageClick();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-brand-400 hover:text-brand-300 hover:bg-surface-800 transition-colors font-semibold"
          >
            Manage Environments
          </button>
        </div>
      )}
    </div>
  );
}
