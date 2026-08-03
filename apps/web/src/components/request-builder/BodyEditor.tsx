import React, { useState, useEffect } from 'react';
import { useRequestStore } from '../../store/request-store.js';
import type { BodyType } from '@nuvro/types';

export function BodyEditor() {
  const { bodyType, bodyContent, headers, setBodyType, setBodyContent, setHeaders } = useRequestStore();
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // Local state for raw subtype (defaults to text/plain)
  const [rawSubtype, setRawSubtype] = useState<'text/plain' | 'application/javascript' | 'text/html' | 'application/xml'>('text/plain');

  // Sync content-type headers automatically when body type changes
  useEffect(() => {
    const cleanHeaders = headers.filter(h => h.key.toLowerCase() !== 'content-type');
    
    if (bodyType === 'JSON' || bodyType === 'GRAPHQL') {
      setHeaders([...cleanHeaders, { key: 'Content-Type', value: 'application/json', enabled: true }]);
    } else if (bodyType === 'RAW') {
      setHeaders([...cleanHeaders, { key: 'Content-Type', value: rawSubtype, enabled: true }]);
    } else if (bodyType === 'FORM_URL_ENCODED') {
      setHeaders([...cleanHeaders, { key: 'Content-Type', value: 'application/x-www-form-urlencoded', enabled: true }]);
    } else if (bodyType === 'BINARY') {
      setHeaders([...cleanHeaders, { key: 'Content-Type', value: 'application/octet-stream', enabled: true }]);
    } else if (bodyType === 'FORM_DATA') {
      // Allow browser/fetch to generate multipart boundary automatically
      setHeaders(cleanHeaders);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyType, rawSubtype]);

  const handleTypeChange = (newType: BodyType) => {
    setBodyType(newType);
    setJsonError(null);
    
    // Set appropriate initial body templates
    if (newType === 'NONE') {
      setBodyContent('');
    } else if (newType === 'JSON') {
      setBodyContent('{\n  \n}');
    } else if (newType === 'FORM_URL_ENCODED' || newType === 'FORM_DATA') {
      setBodyContent(JSON.stringify([{ key: '', value: '', enabled: true }]));
    } else if (newType === 'BINARY') {
      setBodyContent(JSON.stringify({ filename: '', fileContent: '' }));
    } else if (newType === 'GRAPHQL') {
      setBodyContent(JSON.stringify({ query: '', variables: '{\n  \n}', operationName: '' }));
    } else {
      setBodyContent('');
    }
  };

  // Helper: parse JSON lists safely
  const parseJsonArray = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Helper: parse JSON object safely
  const parseJsonObject = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  };

  // Prettify JSON strings
  const formatJson = () => {
    try {
      const parsed = JSON.parse(bodyContent);
      setBodyContent(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : String(err));
    }
  };

  // Standard styling classes
  const labelClassName = "block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5";
  const inputClassName = "bg-surface-950/85 border border-surface-800/80 rounded-lg px-3 py-2 text-xs text-surface-100 placeholder-surface-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 font-mono";
  const tableInputClassName = "w-full bg-transparent border-0 py-1 text-xs text-surface-100 placeholder-surface-700 outline-none focus:ring-1 focus:ring-brand-500/25 rounded px-2";

  return (
    <div className="space-y-4">
      {/* Body selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <label htmlFor="body-type-select" className="text-xs font-bold text-surface-300 min-w-32 uppercase tracking-wide">
          Body Format
        </label>
        <div className="flex flex-wrap gap-2.5">
          <select
            id="body-type-select"
            value={bodyType}
            onChange={(e) => handleTypeChange(e.target.value as BodyType)}
            className="bg-surface-900 border border-surface-800 text-surface-200 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-xs focus:ring-1 focus:ring-brand-500/20"
          >
            <option value="NONE">None</option>
            <option value="JSON">JSON</option>
            <option value="RAW">Raw Text</option>
            <option value="FORM_URL_ENCODED">Form URL Encoded</option>
            <option value="FORM_DATA">Multipart Form Data</option>
            <option value="BINARY">Binary File</option>
            <option value="GRAPHQL">GraphQL Query</option>
          </select>

          {bodyType === 'RAW' && (
            <select
              value={rawSubtype}
              onChange={(e) => setRawSubtype(e.target.value as 'text/plain' | 'application/javascript' | 'text/html' | 'application/xml')}
              className="bg-surface-900 border border-surface-800 text-surface-200 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-xs focus:ring-1 focus:ring-brand-500/20 animate-fade-in"
            >
              <option value="text/plain">Text (text/plain)</option>
              <option value="application/javascript">JavaScript (application/javascript)</option>
              <option value="text/html">HTML (text/html)</option>
              <option value="application/xml">XML (application/xml)</option>
            </select>
          )}
        </div>
      </div>

      <div className="border-t border-surface-800/60 pt-4">
        {bodyType === 'NONE' && (
          <p className="text-xs text-surface-450 italic">
            This request does not send a body content.
          </p>
        )}

        {/* Text Area Editors: JSON, RAW */}
        {(bodyType === 'JSON' || bodyType === 'RAW') && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className={labelClassName}>
                {bodyType === 'JSON' ? 'JSON Content' : 'Raw Content'}
              </span>
              {bodyType === 'JSON' && (
                <button
                  type="button"
                  onClick={formatJson}
                  className="text-[10px] text-brand-400 hover:text-brand-300 font-bold px-2 py-0.5 border border-brand-500/20 hover:border-brand-500/35 rounded transition-all"
                >
                  Prettify JSON
                </button>
              )}
            </div>

            <textarea
              value={bodyContent}
              onChange={(e) => setBodyContent(e.target.value)}
              placeholder={bodyType === 'JSON' ? '{\n  "key": "value"\n}' : 'Enter body text...'}
              className="w-full h-56 bg-surface-950/80 border border-surface-800/80 rounded-xl p-3 text-xs text-surface-150 placeholder-surface-700 font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 resize-y"
            />
            {jsonError && (
              <p className="text-xs text-red-400 font-semibold">{jsonError}</p>
            )}
          </div>
        )}

        {/* Form URL Encoded Grid Editor */}
        {bodyType === 'FORM_URL_ENCODED' && (
          <div className="space-y-3 animate-fade-in">
            <span className={labelClassName}>Form URL Parameters</span>
            <div className="border border-surface-800/80 rounded-xl bg-surface-950/20 overflow-hidden">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-800 bg-surface-950/50 text-surface-450 font-bold">
                    <th className="w-12 px-4 py-2">Use</th>
                    <th className="px-4 py-2">Key</th>
                    <th className="px-4 py-2">Value</th>
                    <th className="w-12 text-center py-2">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-850">
                  {parseJsonArray(bodyContent).map((item: { key: string; value: string; enabled?: boolean }, idx: number) => (
                    <tr key={idx} className="hover:bg-surface-900/30">
                      <td className="px-4 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.enabled !== false}
                          onChange={(e) => {
                            const arr = parseJsonArray(bodyContent);
                            arr[idx].enabled = e.target.checked;
                            setBodyContent(JSON.stringify(arr));
                          }}
                          className="accent-brand-500"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={item.key || ''}
                          placeholder="key"
                          onChange={(e) => {
                            const arr = parseJsonArray(bodyContent);
                            arr[idx].key = e.target.value;
                            // auto add row
                            if (idx === arr.length - 1 && e.target.value) {
                              arr.push({ key: '', value: '', enabled: true });
                            }
                            setBodyContent(JSON.stringify(arr));
                          }}
                          className={tableInputClassName}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          value={item.value || ''}
                          placeholder="value"
                          onChange={(e) => {
                            const arr = parseJsonArray(bodyContent);
                            arr[idx].value = e.target.value;
                            setBodyContent(JSON.stringify(arr));
                          }}
                          className={tableInputClassName}
                        />
                      </td>
                      <td className="px-4 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            let arr = parseJsonArray(bodyContent).filter((_, i) => i !== idx);
                            if (arr.length === 0) arr = [{ key: '', value: '', enabled: true }];
                            setBodyContent(JSON.stringify(arr));
                          }}
                          className="text-surface-550 hover:text-red-400 font-bold"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Multipart Form Data Editor */}
        {bodyType === 'FORM_DATA' && (
          <div className="space-y-3 animate-fade-in">
            <span className={labelClassName}>Multipart Fields</span>
            <div className="border border-surface-800/80 rounded-xl bg-surface-950/20 overflow-hidden">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-800 bg-surface-950/50 text-surface-450 font-bold">
                    <th className="w-12 px-4 py-2">Use</th>
                    <th className="w-20 px-4 py-2">Type</th>
                    <th className="px-4 py-2 w-1/3">Key</th>
                    <th className="px-4 py-2">Value</th>
                    <th className="w-12 text-center py-2">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-850">
                  {parseJsonArray(bodyContent).map((item: { key: string; value?: string; enabled?: boolean; filename?: string; fileContent?: string }, idx: number) => {
                    const isFile = !!item.filename || item.fileContent !== undefined;
                    return (
                      <tr key={idx} className="hover:bg-surface-900/30">
                        <td className="px-4 py-1.5 text-center">
                          <input
                            type="checkbox"
                            checked={item.enabled !== false}
                            onChange={(e) => {
                              const arr = parseJsonArray(bodyContent);
                              arr[idx].enabled = e.target.checked;
                              setBodyContent(JSON.stringify(arr));
                            }}
                            className="accent-brand-500"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <select
                            value={isFile ? 'file' : 'text'}
                            onChange={(e) => {
                              const arr = parseJsonArray(bodyContent);
                              if (e.target.value === 'file') {
                                arr[idx] = { key: item.key || '', filename: '', fileContent: '', enabled: true };
                              } else {
                                arr[idx] = { key: item.key || '', value: '', enabled: true };
                              }
                              setBodyContent(JSON.stringify(arr));
                            }}
                            className="bg-surface-900 text-surface-300 rounded px-1.5 py-0.5 border border-surface-800 outline-none"
                          >
                            <option value="text">Text</option>
                            <option value="file">File</option>
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            value={item.key || ''}
                            placeholder="key"
                            onChange={(e) => {
                              const arr = parseJsonArray(bodyContent);
                              arr[idx].key = e.target.value;
                              if (idx === arr.length - 1 && e.target.value) {
                                arr.push({ key: '', value: '', enabled: true });
                              }
                              setBodyContent(JSON.stringify(arr));
                            }}
                            className={tableInputClassName}
                          />
                        </td>
                        <td className="px-4 py-1.5 align-middle">
                          {isFile ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new window.FileReader();
                                  reader.onload = () => {
                                    const base64 = reader.result?.toString().split(',')[1] || '';
                                    const arr = parseJsonArray(bodyContent);
                                    arr[idx].filename = file.name;
                                    arr[idx].fileContent = base64;
                                    setBodyContent(JSON.stringify(arr));
                                  };
                                  reader.readAsDataURL(file);
                                }}
                                className="hidden"
                                id={`file-input-${idx}`}
                              />
                              <label
                                htmlFor={`file-input-${idx}`}
                                className="cursor-pointer text-[10px] font-bold uppercase bg-surface-900 hover:bg-surface-800 border border-surface-800 text-surface-200 px-3 py-1 rounded transition-colors"
                              >
                                {item.filename ? 'Replace File' : 'Choose File'}
                              </label>
                              {item.filename && (
                                <span className="text-[10px] text-brand-400 font-mono truncate max-w-xs">{item.filename}</span>
                              )}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={item.value || ''}
                              placeholder="value"
                              onChange={(e) => {
                                const arr = parseJsonArray(bodyContent);
                                arr[idx].value = e.target.value;
                                setBodyContent(JSON.stringify(arr));
                              }}
                              className={tableInputClassName}
                            />
                          )}
                        </td>
                        <td className="px-4 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              let arr = parseJsonArray(bodyContent).filter((_, i) => i !== idx);
                              if (arr.length === 0) arr = [{ key: '', value: '', enabled: true }];
                              setBodyContent(JSON.stringify(arr));
                            }}
                            className="text-surface-550 hover:text-red-400 font-bold"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Binary File Upload Editor */}
        {bodyType === 'BINARY' && (
          <div className="space-y-3 animate-fade-in max-w-lg">
            <span className={labelClassName}>Select Binary File</span>
            <div className="border border-dashed border-surface-800 rounded-xl p-6 flex flex-col items-center justify-center bg-surface-950/20 text-center">
              <input
                type="file"
                id="binary-file-input"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new window.FileReader();
                  reader.onload = () => {
                    const base64 = reader.result?.toString().split(',')[1] || '';
                    setBodyContent(JSON.stringify({
                      filename: file.name,
                      fileContent: base64,
                    }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <label
                htmlFor="binary-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2 text-xs text-surface-400"
              >
                <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <span className="font-bold text-brand-400 hover:underline">Click to upload raw binary</span>
                {parseJsonObject(bodyContent).filename ? (
                  <span className="text-[10px] font-mono text-brand-400 bg-brand-500/5 px-2 py-1 rounded border border-brand-500/10 mt-1">
                    Selected: {parseJsonObject(bodyContent).filename}
                  </span>
                ) : (
                  <span className="text-[10px] text-surface-500">Any file content is supported</span>
                )}
              </label>
            </div>
          </div>
        )}

        {/* GraphQL Editor */}
        {bodyType === 'GRAPHQL' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Query Field */}
              <div className="space-y-1.5">
                <span className={labelClassName}>GraphQL Query</span>
                <textarea
                  value={parseJsonObject(bodyContent).query || ''}
                  onChange={(e) => {
                    const parsed = parseJsonObject(bodyContent);
                    parsed.query = e.target.value;
                    setBodyContent(JSON.stringify(parsed));
                  }}
                  placeholder="query GetUser { ... }"
                  className="w-full h-64 bg-surface-950/80 border border-surface-800/80 rounded-xl p-3 text-xs text-surface-150 placeholder-surface-700 font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 resize-y"
                />
              </div>

              {/* Variables JSON Field */}
              <div className="space-y-1.5">
                <span className={labelClassName}>Query Variables (JSON)</span>
                <textarea
                  value={parseJsonObject(bodyContent).variables || ''}
                  onChange={(e) => {
                    const parsed = parseJsonObject(bodyContent);
                    parsed.variables = e.target.value;
                    setBodyContent(JSON.stringify(parsed));
                  }}
                  placeholder={'{\n  "id": "123"\n}'}
                  className="w-full h-64 bg-surface-950/80 border border-surface-800/80 rounded-xl p-3 text-xs text-surface-150 placeholder-surface-700 font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 resize-y"
                />
              </div>
            </div>

            {/* Optional Operation Name */}
            <div className="flex flex-col gap-1.5 max-w-sm">
              <label htmlFor="graphql-opname" className={labelClassName}>
                Operation Name <span className="font-normal text-surface-650">(optional)</span>
              </label>
              <input
                id="graphql-opname"
                type="text"
                value={parseJsonObject(bodyContent).operationName || ''}
                onChange={(e) => {
                  const parsed = parseJsonObject(bodyContent);
                  parsed.operationName = e.target.value;
                  setBodyContent(JSON.stringify(parsed));
                }}
                placeholder="e.g. GetUser"
                className={inputClassName}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
