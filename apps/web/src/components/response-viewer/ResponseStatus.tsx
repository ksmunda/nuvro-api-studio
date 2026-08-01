import React from 'react';

interface ResponseStatusProps {
  statusCode: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
}

export function ResponseStatus({ statusCode, statusText, durationMs, sizeBytes }: ResponseStatusProps) {
  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (code >= 300 && code < 400) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (code >= 400 && code < 500) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs font-semibold select-none">
      {/* HTTP Status Code */}
      <span className={`px-2.5 py-1 rounded border ${getStatusColor(statusCode)}`}>
        {statusCode} {statusText}
      </span>

      {/* Execution Time */}
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-surface-800 bg-surface-900/60 text-surface-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-surface-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {formatDuration(durationMs)}
      </span>

      {/* Payload Size */}
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-surface-800 bg-surface-900/60 text-surface-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-surface-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75h3m-3 3h3m-3.75-6h.008v.008H4.5V9.75zm.75 0h.008v.008H5.25V9.75z" />
        </svg>
        {formatSize(sizeBytes)}
      </span>
    </div>
  );
}
