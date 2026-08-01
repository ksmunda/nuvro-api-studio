import React from 'react';
import type { KeyValuePair } from '@nuvro/types';

interface KeyValueEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addButtonText?: string;
}

export function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  addButtonText = 'Add Row',
}: KeyValueEditorProps) {
  
  const handleRowChange = (index: number, updates: Partial<KeyValuePair>) => {
    const updated = pairs.map((pair, idx) => {
      if (idx === index) {
        return { ...pair, ...updates };
      }
      return pair;
    });
    
    // Auto-append row if user starts typing in the last empty row
    const lastRow = updated[updated.length - 1];
    if (lastRow && (lastRow.key.trim() !== '' || lastRow.value.trim() !== '') && index === updated.length - 1) {
      updated.push({ key: '', value: '', enabled: true });
    }
    
    onChange(updated);
  };

  const handleRemoveRow = (index: number) => {
    let updated = pairs.filter((_, idx) => idx !== index);
    if (updated.length === 0) {
      updated = [{ key: '', value: '', enabled: true }];
    }
    onChange(updated);
  };

  const handleAddRow = () => {
    onChange([...pairs, { key: '', value: '', enabled: true }]);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-surface-800 rounded-lg bg-surface-900/50">
        <table className="min-w-full divide-y divide-surface-800 text-sm">
          <thead className="bg-surface-900">
            <tr>
              <th scope="col" className="w-12 px-4 py-2 text-left font-medium text-surface-400">
                Use
              </th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-surface-400">
                Key
              </th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-surface-400">
                Value
              </th>
              <th scope="col" className="w-12 px-4 py-2 text-center font-medium text-surface-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {pairs.map((pair, index) => (
              <tr key={index} className="hover:bg-surface-800/30 transition-colors">
                <td className="px-4 py-2 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={pair.enabled !== false}
                    onChange={(e) => handleRowChange(index, { enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-surface-700 bg-surface-950 text-brand-500 focus:ring-brand-500/20 focus:ring-offset-0"
                    aria-label="Enable parameter"
                  />
                </td>
                <td className="px-2 py-1 align-middle">
                  <input
                    type="text"
                    value={pair.key}
                    placeholder={keyPlaceholder}
                    onChange={(e) => handleRowChange(index, { key: e.target.value })}
                    className="w-full bg-transparent border-0 py-1.5 text-surface-100 placeholder-surface-500 focus:ring-1 focus:ring-brand-500/30 rounded px-2"
                  />
                </td>
                <td className="px-2 py-1 align-middle">
                  <input
                    type="text"
                    value={pair.value}
                    placeholder={valuePlaceholder}
                    onChange={(e) => handleRowChange(index, { value: e.target.value })}
                    className="w-full bg-transparent border-0 py-1.5 text-surface-100 placeholder-surface-500 focus:ring-1 focus:ring-brand-500/30 rounded px-2"
                  />
                </td>
                <td className="px-4 py-2 text-center align-middle">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="text-surface-500 hover:text-red-400 transition-colors p-1"
                    title="Remove row"
                    aria-label="Remove row"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4.5 h-4.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={handleAddRow}
        className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 font-semibold px-2 py-1 rounded transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {addButtonText}
      </button>
    </div>
  );
}
