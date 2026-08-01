import React from 'react';

interface ResponseHeadersProps {
  headers: Record<string, string>;
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const headerEntries = Object.entries(headers);

  if (headerEntries.length === 0) {
    return <p className="text-sm text-surface-400">No response headers returned.</p>;
  }

  return (
    <div className="overflow-x-auto border border-surface-800 rounded-lg bg-surface-950">
      <table className="min-w-full divide-y divide-surface-800 text-xs font-mono">
        <thead className="bg-surface-900/60 font-sans">
          <tr>
            <th scope="col" className="px-4 py-2.5 text-left font-semibold text-surface-400 border-r border-surface-800">
              Header
            </th>
            <th scope="col" className="px-4 py-2.5 text-left font-semibold text-surface-400">
              Value
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-800/80">
          {headerEntries.map(([key, value]) => (
            <tr key={key} className="hover:bg-surface-900/20 transition-colors">
              <td className="px-4 py-2 text-brand-400 font-semibold border-r border-surface-800 break-all select-all">
                {key}
              </td>
              <td className="px-4 py-2 text-surface-350 break-all select-all">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
