import React from 'react';
import { useRequestStore } from '../../store/request-store.js';
import { KeyValueEditor } from './KeyValueEditor.js';

export function HeadersEditor() {
  const { headers, setHeaders } = useRequestStore();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider mb-2">Request Headers</h3>
      <KeyValueEditor
        pairs={headers}
        onChange={setHeaders}
        keyPlaceholder="Header Key"
        valuePlaceholder="Value"
        addButtonText="Add Header"
      />
    </div>
  );
}
