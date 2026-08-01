import React from 'react';
import { useRequestStore } from '../../store/request-store.js';

export function RequestTabs() {
  const { activeTab, setActiveTab, queryParams, headers, authType, bodyType } = useRequestStore();

  const getCount = (tab: string) => {
    if (tab === 'params') {
      const cnt = queryParams.filter((q) => q.key.trim() !== '').length;
      return cnt > 0 ? cnt : null;
    }
    if (tab === 'headers') {
      const cnt = headers.filter((h) => h.key.trim() !== '').length;
      return cnt > 0 ? cnt : null;
    }
    return null;
  };

  const hasIndicator = (tab: string) => {
    if (tab === 'auth') {
      return authType !== 'NONE';
    }
    if (tab === 'body') {
      return bodyType !== 'NONE';
    }
    return false;
  };

  const renderTab = (id: 'params' | 'auth' | 'headers' | 'body', label: string) => {
    const isActive = activeTab === id;
    const count = getCount(id);
    const indicator = hasIndicator(id);

    return (
      <button
        key={id}
        type="button"
        onClick={() => setActiveTab(id)}
        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all relative flex items-center gap-1.5 ${
          isActive
            ? 'border-brand-500 text-brand-400'
            : 'border-transparent text-surface-400 hover:text-surface-200'
        }`}
      >
        {label}
        {count !== null && (
          <span className="text-[10px] bg-surface-800 text-surface-300 rounded-full px-1.5 py-0.5 min-w-4 text-center font-bold">
            {count}
          </span>
        )}
        {indicator && (
          <span className="w-1.5 h-1.5 bg-brand-400 rounded-full inline-block" />
        )}
      </button>
    );
  };

  return (
    <div className="flex border-b border-surface-800/80">
      {renderTab('params', 'Params')}
      {renderTab('auth', 'Authorization')}
      {renderTab('headers', 'Headers')}
      {renderTab('body', 'Body')}
    </div>
  );
}
