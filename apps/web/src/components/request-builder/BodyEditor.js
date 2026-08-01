import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRequestStore } from '../../store/request-store.js';
export function BodyEditor() {
    const { bodyType, bodyContent, headers, setBodyType, setBodyContent } = useRequestStore();
    const [jsonError, setJsonError] = useState(null);
    const handleTypeChange = (newType) => {
        setBodyType(newType);
        setJsonError(null);
    };
    const handleBodyChange = (value) => {
        setBodyContent(value);
        if (bodyType === 'JSON' && value.trim() !== '') {
            try {
                JSON.parse(value);
                setJsonError(null);
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                setJsonError(`Invalid JSON: ${message}`);
            }
        }
        else {
            setJsonError(null);
        }
    };
    const formatJson = () => {
        try {
            if (bodyContent.trim() === '')
                return;
            const parsed = JSON.parse(bodyContent);
            const formatted = JSON.stringify(parsed, null, 2);
            setBodyContent(formatted);
            setJsonError(null);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setJsonError(`Cannot format: ${message}`);
        }
    };
    // Check if Content-Type header is already manually defined
    const hasContentTypeHeader = headers.some((h) => h.enabled && h.key.toLowerCase() === 'content-type');
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-start md:items-center", children: [_jsx("label", { htmlFor: "body-type-select", className: "text-sm font-medium text-surface-300 min-w-32", children: "Body Type" }), _jsxs("select", { id: "body-type-select", value: bodyType, onChange: (e) => handleTypeChange(e.target.value), className: "bg-surface-900 border border-surface-700 text-surface-100 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-sm focus:ring-1 focus:ring-brand-500/20", children: [_jsx("option", { value: "NONE", children: "None" }), _jsx("option", { value: "JSON", children: "JSON" }), _jsx("option", { value: "RAW", children: "Raw Text" })] })] }), _jsxs("div", { className: "border-t border-surface-800/60 pt-4", children: [bodyType === 'NONE' && (_jsx("p", { className: "text-sm text-surface-400", children: "This request does not send a body content." })), bodyType !== 'NONE' && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-surface-400 font-semibold uppercase tracking-wider", children: bodyType === 'JSON' ? 'JSON Content' : 'Raw Content' }), bodyType === 'JSON' && (_jsx("button", { type: "button", onClick: formatJson, className: "text-xs text-brand-400 hover:text-brand-300 font-semibold px-2 py-0.5 bg-brand-500/10 hover:bg-brand-500/20 rounded transition-colors", children: "Prettify JSON" }))] }), _jsx("div", { className: "relative", children: _jsx("textarea", { value: bodyContent, onChange: (e) => handleBodyChange(e.target.value), placeholder: bodyType === 'JSON'
                                        ? '{\n  "key": "value"\n}'
                                        : 'Enter raw request body here...', className: "w-full h-64 bg-surface-950 border border-surface-800 rounded p-3 text-sm text-surface-100 placeholder-surface-700 font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 resize-y" }) }), jsonError && (_jsx("p", { className: "text-xs text-red-400 font-medium", children: jsonError })), bodyType === 'JSON' && !hasContentTypeHeader && (_jsxs("p", { className: "text-xs text-yellow-500/80 font-medium flex items-center gap-1", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: "w-3.5 h-3.5", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" }) }), "Note: \"Content-Type: application/json\" will be sent automatically."] }))] }))] })] }));
}
//# sourceMappingURL=BodyEditor.js.map