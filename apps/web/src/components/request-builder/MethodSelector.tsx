import React from 'react';
import { useRequestStore } from '../../store/request-store.js';
import type { HttpMethod } from '@nuvro/types';

export function MethodSelector() {
  const { method, setMethod } = useRequestStore();

  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  const getMethodColor = (m: HttpMethod) => {
    switch (m) {
      case 'GET':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'POST':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'PUT':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'PATCH':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'DELETE':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-surface-400 bg-surface-500/10 border-surface-500/20';
    }
  };

  return (
    <div className="relative">
      <select
        id="method-selector"
        value={method}
        onChange={(e) => setMethod(e.target.value as HttpMethod)}
        className={`appearance-none font-bold text-sm tracking-wider px-4 pr-8 py-2.5 rounded-l-lg border-y border-l border-surface-800 bg-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-500/20 cursor-pointer ${getMethodColor(
          method
        )}`}
        aria-label="HTTP Method"
      >
        {methods.map((m) => (
          <option key={m} value={m} className="bg-surface-950 font-semibold text-surface-200">
            {m}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-surface-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-3.5 h-3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}
