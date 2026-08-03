import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRequestStore } from '../../store/request-store.js';
export function BodyEditor() {
    const { bodyType, bodyContent, headers, setBodyType, setBodyContent, setHeaders } = useRequestStore();
    const [jsonError, setJsonError] = useState(null);
    // Local state for raw subtype (defaults to text/plain)
    const [rawSubtype, setRawSubtype] = useState('text/plain');
    // Sync content-type headers automatically when body type changes
    useEffect(() => {
        const cleanHeaders = headers.filter(h => h.key.toLowerCase() !== 'content-type');
        if (bodyType === 'JSON' || bodyType === 'GRAPHQL') {
            setHeaders([...cleanHeaders, { key: 'Content-Type', value: 'application/json', enabled: true }]);
        }
        else if (bodyType === 'RAW') {
            setHeaders([...cleanHeaders, { key: 'Content-Type', value: rawSubtype, enabled: true }]);
        }
        else if (bodyType === 'FORM_URL_ENCODED') {
            setHeaders([...cleanHeaders, { key: 'Content-Type', value: 'application/x-www-form-urlencoded', enabled: true }]);
        }
        else if (bodyType === 'BINARY') {
            setHeaders([...cleanHeaders, { key: 'Content-Type', value: 'application/octet-stream', enabled: true }]);
        }
        else if (bodyType === 'FORM_DATA') {
            // Allow browser/fetch to generate multipart boundary automatically
            setHeaders(cleanHeaders);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bodyType, rawSubtype]);
    const handleTypeChange = (newType) => {
        setBodyType(newType);
        setJsonError(null);
        // Set appropriate initial body templates
        if (newType === 'NONE') {
            setBodyContent('');
        }
        else if (newType === 'JSON') {
            setBodyContent('{\n  \n}');
        }
        else if (newType === 'FORM_URL_ENCODED' || newType === 'FORM_DATA') {
            setBodyContent(JSON.stringify([{ key: '', value: '', enabled: true }]));
        }
        else if (newType === 'BINARY') {
            setBodyContent(JSON.stringify({ filename: '', fileContent: '' }));
        }
        else if (newType === 'GRAPHQL') {
            setBodyContent(JSON.stringify({ query: '', variables: '{\n  \n}', operationName: '' }));
        }
        else {
            setBodyContent('');
        }
    };
    // Helper: parse JSON lists safely
    const parseJsonArray = (str) => {
        try {
            const parsed = JSON.parse(str);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    };
    // Helper: parse JSON object safely
    const parseJsonObject = (str) => {
        try {
            return JSON.parse(str);
        }
        catch {
            return {};
        }
    };
    // Prettify JSON strings
    const formatJson = () => {
        try {
            const parsed = JSON.parse(bodyContent);
            setBodyContent(JSON.stringify(parsed, null, 2));
            setJsonError(null);
        }
        catch (err) {
            setJsonError(err instanceof Error ? err.message : String(err));
        }
    };
    // Standard styling classes
    const labelClassName = "block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5";
    const inputClassName = "bg-surface-950/85 border border-surface-800/80 rounded-lg px-3 py-2 text-xs text-surface-100 placeholder-surface-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 font-mono";
    const tableInputClassName = "w-full bg-transparent border-0 py-1 text-xs text-surface-100 placeholder-surface-700 outline-none focus:ring-1 focus:ring-brand-500/25 rounded px-2";
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4", children: [_jsx("label", { htmlFor: "body-type-select", className: "text-xs font-bold text-surface-300 min-w-32 uppercase tracking-wide", children: "Body Format" }), _jsxs("div", { className: "flex flex-wrap gap-2.5", children: [_jsxs("select", { id: "body-type-select", value: bodyType, onChange: (e) => handleTypeChange(e.target.value), className: "bg-surface-900 border border-surface-800 text-surface-200 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-xs focus:ring-1 focus:ring-brand-500/20", children: [_jsx("option", { value: "NONE", children: "None" }), _jsx("option", { value: "JSON", children: "JSON" }), _jsx("option", { value: "RAW", children: "Raw Text" }), _jsx("option", { value: "FORM_URL_ENCODED", children: "Form URL Encoded" }), _jsx("option", { value: "FORM_DATA", children: "Multipart Form Data" }), _jsx("option", { value: "BINARY", children: "Binary File" }), _jsx("option", { value: "GRAPHQL", children: "GraphQL Query" })] }), bodyType === 'RAW' && (_jsxs("select", { value: rawSubtype, onChange: (e) => setRawSubtype(e.target.value), className: "bg-surface-900 border border-surface-800 text-surface-200 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-xs focus:ring-1 focus:ring-brand-500/20 animate-fade-in", children: [_jsx("option", { value: "text/plain", children: "Text (text/plain)" }), _jsx("option", { value: "application/javascript", children: "JavaScript (application/javascript)" }), _jsx("option", { value: "text/html", children: "HTML (text/html)" }), _jsx("option", { value: "application/xml", children: "XML (application/xml)" })] }))] })] }), _jsxs("div", { className: "border-t border-surface-800/60 pt-4", children: [bodyType === 'NONE' && (_jsx("p", { className: "text-xs text-surface-450 italic", children: "This request does not send a body content." })), (bodyType === 'JSON' || bodyType === 'RAW') && (_jsxs("div", { className: "space-y-3 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: labelClassName, children: bodyType === 'JSON' ? 'JSON Content' : 'Raw Content' }), bodyType === 'JSON' && (_jsx("button", { type: "button", onClick: formatJson, className: "text-[10px] text-brand-400 hover:text-brand-300 font-bold px-2 py-0.5 border border-brand-500/20 hover:border-brand-500/35 rounded transition-all", children: "Prettify JSON" }))] }), _jsx("textarea", { value: bodyContent, onChange: (e) => setBodyContent(e.target.value), placeholder: bodyType === 'JSON' ? '{\n  "key": "value"\n}' : 'Enter body text...', className: "w-full h-56 bg-surface-950/80 border border-surface-800/80 rounded-xl p-3 text-xs text-surface-150 placeholder-surface-700 font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 resize-y" }), jsonError && (_jsx("p", { className: "text-xs text-red-400 font-semibold", children: jsonError }))] })), bodyType === 'FORM_URL_ENCODED' && (_jsxs("div", { className: "space-y-3 animate-fade-in", children: [_jsx("span", { className: labelClassName, children: "Form URL Parameters" }), _jsx("div", { className: "border border-surface-800/80 rounded-xl bg-surface-950/20 overflow-hidden", children: _jsxs("table", { className: "min-w-full text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-surface-800 bg-surface-950/50 text-surface-450 font-bold", children: [_jsx("th", { className: "w-12 px-4 py-2", children: "Use" }), _jsx("th", { className: "px-4 py-2", children: "Key" }), _jsx("th", { className: "px-4 py-2", children: "Value" }), _jsx("th", { className: "w-12 text-center py-2", children: "Remove" })] }) }), _jsx("tbody", { className: "divide-y divide-surface-850", children: parseJsonArray(bodyContent).map((item, idx) => (_jsxs("tr", { className: "hover:bg-surface-900/30", children: [_jsx("td", { className: "px-4 py-1.5 text-center", children: _jsx("input", { type: "checkbox", checked: item.enabled !== false, onChange: (e) => {
                                                                const arr = parseJsonArray(bodyContent);
                                                                arr[idx].enabled = e.target.checked;
                                                                setBodyContent(JSON.stringify(arr));
                                                            }, className: "accent-brand-500" }) }), _jsx("td", { className: "px-2 py-1.5", children: _jsx("input", { type: "text", value: item.key || '', placeholder: "key", onChange: (e) => {
                                                                const arr = parseJsonArray(bodyContent);
                                                                arr[idx].key = e.target.value;
                                                                // auto add row
                                                                if (idx === arr.length - 1 && e.target.value) {
                                                                    arr.push({ key: '', value: '', enabled: true });
                                                                }
                                                                setBodyContent(JSON.stringify(arr));
                                                            }, className: tableInputClassName }) }), _jsx("td", { className: "px-2 py-1.5", children: _jsx("input", { type: "text", value: item.value || '', placeholder: "value", onChange: (e) => {
                                                                const arr = parseJsonArray(bodyContent);
                                                                arr[idx].value = e.target.value;
                                                                setBodyContent(JSON.stringify(arr));
                                                            }, className: tableInputClassName }) }), _jsx("td", { className: "px-4 py-1.5 text-center", children: _jsx("button", { type: "button", onClick: () => {
                                                                let arr = parseJsonArray(bodyContent).filter((_, i) => i !== idx);
                                                                if (arr.length === 0)
                                                                    arr = [{ key: '', value: '', enabled: true }];
                                                                setBodyContent(JSON.stringify(arr));
                                                            }, className: "text-surface-550 hover:text-red-400 font-bold", children: "\u2715" }) })] }, idx))) })] }) })] })), bodyType === 'FORM_DATA' && (_jsxs("div", { className: "space-y-3 animate-fade-in", children: [_jsx("span", { className: labelClassName, children: "Multipart Fields" }), _jsx("div", { className: "border border-surface-800/80 rounded-xl bg-surface-950/20 overflow-hidden", children: _jsxs("table", { className: "min-w-full text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-surface-800 bg-surface-950/50 text-surface-450 font-bold", children: [_jsx("th", { className: "w-12 px-4 py-2", children: "Use" }), _jsx("th", { className: "w-20 px-4 py-2", children: "Type" }), _jsx("th", { className: "px-4 py-2 w-1/3", children: "Key" }), _jsx("th", { className: "px-4 py-2", children: "Value" }), _jsx("th", { className: "w-12 text-center py-2", children: "Remove" })] }) }), _jsx("tbody", { className: "divide-y divide-surface-850", children: parseJsonArray(bodyContent).map((item, idx) => {
                                                const isFile = !!item.filename || item.fileContent !== undefined;
                                                return (_jsxs("tr", { className: "hover:bg-surface-900/30", children: [_jsx("td", { className: "px-4 py-1.5 text-center", children: _jsx("input", { type: "checkbox", checked: item.enabled !== false, onChange: (e) => {
                                                                    const arr = parseJsonArray(bodyContent);
                                                                    arr[idx].enabled = e.target.checked;
                                                                    setBodyContent(JSON.stringify(arr));
                                                                }, className: "accent-brand-500" }) }), _jsx("td", { className: "px-2 py-1.5", children: _jsxs("select", { value: isFile ? 'file' : 'text', onChange: (e) => {
                                                                    const arr = parseJsonArray(bodyContent);
                                                                    if (e.target.value === 'file') {
                                                                        arr[idx] = { key: item.key || '', filename: '', fileContent: '', enabled: true };
                                                                    }
                                                                    else {
                                                                        arr[idx] = { key: item.key || '', value: '', enabled: true };
                                                                    }
                                                                    setBodyContent(JSON.stringify(arr));
                                                                }, className: "bg-surface-900 text-surface-300 rounded px-1.5 py-0.5 border border-surface-800 outline-none", children: [_jsx("option", { value: "text", children: "Text" }), _jsx("option", { value: "file", children: "File" })] }) }), _jsx("td", { className: "px-2 py-1.5", children: _jsx("input", { type: "text", value: item.key || '', placeholder: "key", onChange: (e) => {
                                                                    const arr = parseJsonArray(bodyContent);
                                                                    arr[idx].key = e.target.value;
                                                                    if (idx === arr.length - 1 && e.target.value) {
                                                                        arr.push({ key: '', value: '', enabled: true });
                                                                    }
                                                                    setBodyContent(JSON.stringify(arr));
                                                                }, className: tableInputClassName }) }), _jsx("td", { className: "px-4 py-1.5 align-middle", children: isFile ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "file", onChange: (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (!file)
                                                                                return;
                                                                            const reader = new window.FileReader();
                                                                            reader.onload = () => {
                                                                                const base64 = reader.result?.toString().split(',')[1] || '';
                                                                                const arr = parseJsonArray(bodyContent);
                                                                                arr[idx].filename = file.name;
                                                                                arr[idx].fileContent = base64;
                                                                                setBodyContent(JSON.stringify(arr));
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }, className: "hidden", id: `file-input-${idx}` }), _jsx("label", { htmlFor: `file-input-${idx}`, className: "cursor-pointer text-[10px] font-bold uppercase bg-surface-900 hover:bg-surface-800 border border-surface-800 text-surface-200 px-3 py-1 rounded transition-colors", children: item.filename ? 'Replace File' : 'Choose File' }), item.filename && (_jsx("span", { className: "text-[10px] text-brand-400 font-mono truncate max-w-xs", children: item.filename }))] })) : (_jsx("input", { type: "text", value: item.value || '', placeholder: "value", onChange: (e) => {
                                                                    const arr = parseJsonArray(bodyContent);
                                                                    arr[idx].value = e.target.value;
                                                                    setBodyContent(JSON.stringify(arr));
                                                                }, className: tableInputClassName })) }), _jsx("td", { className: "px-4 py-1.5 text-center", children: _jsx("button", { type: "button", onClick: () => {
                                                                    let arr = parseJsonArray(bodyContent).filter((_, i) => i !== idx);
                                                                    if (arr.length === 0)
                                                                        arr = [{ key: '', value: '', enabled: true }];
                                                                    setBodyContent(JSON.stringify(arr));
                                                                }, className: "text-surface-550 hover:text-red-400 font-bold", children: "\u2715" }) })] }, idx));
                                            }) })] }) })] })), bodyType === 'BINARY' && (_jsxs("div", { className: "space-y-3 animate-fade-in max-w-lg", children: [_jsx("span", { className: labelClassName, children: "Select Binary File" }), _jsxs("div", { className: "border border-dashed border-surface-800 rounded-xl p-6 flex flex-col items-center justify-center bg-surface-950/20 text-center", children: [_jsx("input", { type: "file", id: "binary-file-input", className: "hidden", onChange: (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file)
                                                return;
                                            const reader = new window.FileReader();
                                            reader.onload = () => {
                                                const base64 = reader.result?.toString().split(',')[1] || '';
                                                setBodyContent(JSON.stringify({
                                                    filename: file.name,
                                                    fileContent: base64,
                                                }));
                                            };
                                            reader.readAsDataURL(file);
                                        } }), _jsxs("label", { htmlFor: "binary-file-input", className: "cursor-pointer flex flex-col items-center justify-center gap-2 text-xs text-surface-400", children: [_jsx("svg", { className: "w-8 h-8 text-brand-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" }) }), _jsx("span", { className: "font-bold text-brand-400 hover:underline", children: "Click to upload raw binary" }), parseJsonObject(bodyContent).filename ? (_jsxs("span", { className: "text-[10px] font-mono text-brand-400 bg-brand-500/5 px-2 py-1 rounded border border-brand-500/10 mt-1", children: ["Selected: ", parseJsonObject(bodyContent).filename] })) : (_jsx("span", { className: "text-[10px] text-surface-500", children: "Any file content is supported" }))] })] })] })), bodyType === 'GRAPHQL' && (_jsxs("div", { className: "space-y-4 animate-fade-in", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("span", { className: labelClassName, children: "GraphQL Query" }), _jsx("textarea", { value: parseJsonObject(bodyContent).query || '', onChange: (e) => {
                                                    const parsed = parseJsonObject(bodyContent);
                                                    parsed.query = e.target.value;
                                                    setBodyContent(JSON.stringify(parsed));
                                                }, placeholder: "query GetUser { ... }", className: "w-full h-64 bg-surface-950/80 border border-surface-800/80 rounded-xl p-3 text-xs text-surface-150 placeholder-surface-700 font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 resize-y" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("span", { className: labelClassName, children: "Query Variables (JSON)" }), _jsx("textarea", { value: parseJsonObject(bodyContent).variables || '', onChange: (e) => {
                                                    const parsed = parseJsonObject(bodyContent);
                                                    parsed.variables = e.target.value;
                                                    setBodyContent(JSON.stringify(parsed));
                                                }, placeholder: '{\n  "id": "123"\n}', className: "w-full h-64 bg-surface-950/80 border border-surface-800/80 rounded-xl p-3 text-xs text-surface-150 placeholder-surface-700 font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 resize-y" })] })] }), _jsxs("div", { className: "flex flex-col gap-1.5 max-w-sm", children: [_jsxs("label", { htmlFor: "graphql-opname", className: labelClassName, children: ["Operation Name ", _jsx("span", { className: "font-normal text-surface-650", children: "(optional)" })] }), _jsx("input", { id: "graphql-opname", type: "text", value: parseJsonObject(bodyContent).operationName || '', onChange: (e) => {
                                            const parsed = parseJsonObject(bodyContent);
                                            parsed.operationName = e.target.value;
                                            setBodyContent(JSON.stringify(parsed));
                                        }, placeholder: "e.g. GetUser", className: inputClassName })] })] }))] })] }));
}
//# sourceMappingURL=BodyEditor.js.map