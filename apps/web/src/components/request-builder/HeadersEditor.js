import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRequestStore } from '../../store/request-store.js';
import { KeyValueEditor } from './KeyValueEditor.js';
export function HeadersEditor() {
    const { headers, setHeaders } = useRequestStore();
    return (_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-sm font-semibold text-surface-200 uppercase tracking-wider mb-2", children: "Request Headers" }), _jsx(KeyValueEditor, { pairs: headers, onChange: setHeaders, keyPlaceholder: "Header Key", valuePlaceholder: "Value", addButtonText: "Add Header" })] }));
}
//# sourceMappingURL=HeadersEditor.js.map