import React from 'react';
import { useRequestStore } from '../../store/request-store.js';
import { ResponseStatus } from './ResponseStatus.js';
import { ResponseBody } from './ResponseBody.js';
import { ResponseHeaders } from './ResponseHeaders.js';

export function ResponseViewer() {
  const { response, isLoading, error, responseActiveTab, setResponseActiveTab } = useRequestStore();

  if (isLoading) {
    return (
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] shadow-xl space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        </div>
        <p className="text-sm font-semibold text-surface-300 animate-pulse">
          Sending request...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-900 border border-red-500/30 rounded-xl p-6 min-h-[200px] shadow-xl flex flex-col justify-center space-y-3">
        <div className="flex items-center gap-2.5 text-red-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <h3 className="font-bold text-sm tracking-wide uppercase">Request Execution Error</h3>
        </div>
        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 font-mono text-xs text-red-300 whitespace-pre-wrap">
          {error}
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] shadow-xl text-center">
        <div className="p-4 bg-surface-950/60 rounded-full border border-surface-800/40 text-surface-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </div>
        <h3 className="font-bold text-base text-surface-200 mb-1">No Active Response</h3>
        <p className="text-sm text-surface-400 max-w-sm">
          Configure your URL, method, and headers above, then click Send to dispatch an outbound request.
        </p>
      </div>
    );
  }

  const contentType = response.headers['content-type'] || '';

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 md:p-6 shadow-xl space-y-6">
      {/* Response Header Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-800/80 pb-4">
        <h3 className="font-bold text-sm text-surface-200 uppercase tracking-wider">
          Response Status
        </h3>
        <ResponseStatus
          statusCode={response.statusCode}
          statusText={response.statusText}
          durationMs={response.durationMs}
          sizeBytes={response.sizeBytes}
        />
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-surface-800/80">
        <button
          type="button"
          onClick={() => setResponseActiveTab('body')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            responseActiveTab === 'body'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-surface-400 hover:text-surface-200'
          }`}
        >
          Response Body
        </button>
        <button
          type="button"
          onClick={() => setResponseActiveTab('headers')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            responseActiveTab === 'headers'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-surface-400 hover:text-surface-200'
          }`}
        >
          Headers ({Object.keys(response.headers).length})
        </button>
      </div>

      {/* Tab Panel */}
      <div className="pt-2">
        {responseActiveTab === 'body' ? (
          <ResponseBody body={response.body} contentType={contentType} />
        ) : (
          <ResponseHeaders headers={response.headers} />
        )}
      </div>
    </div>
  );
}
