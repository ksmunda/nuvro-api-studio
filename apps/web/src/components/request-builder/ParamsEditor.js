import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRequestStore } from '../../store/request-store.js';
import { KeyValueEditor } from './KeyValueEditor.js';
export function ParamsEditor() {
    const { queryParams, setQueryParams } = useRequestStore();
    return (_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-sm font-semibold text-surface-200 uppercase tracking-wider mb-2", children: "Query Parameters" }), _jsx(KeyValueEditor, { pairs: queryParams, onChange: setQueryParams, keyPlaceholder: "Parameter Key", valuePlaceholder: "Value", addButtonText: "Add Parameter" })] }));
}
//# sourceMappingURL=ParamsEditor.js.map