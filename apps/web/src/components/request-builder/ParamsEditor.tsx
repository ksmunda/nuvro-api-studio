import React from 'react';
import { useRequestStore } from '../../store/request-store.js';
import { KeyValueEditor } from './KeyValueEditor.js';

export function ParamsEditor() {
  const { queryParams, setQueryParams } = useRequestStore();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider mb-2">Query Parameters</h3>
      <KeyValueEditor
        pairs={queryParams}
        onChange={setQueryParams}
        keyPlaceholder="Parameter Key"
        valuePlaceholder="Value"
        addButtonText="Add Parameter"
      />
    </div>
  );
}
