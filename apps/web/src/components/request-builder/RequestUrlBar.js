import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRequestStore } from '../../store/request-store.js';
export function RequestUrlBar({ onSend }) {
    const { url, setUrl, isLoading } = useRequestStore();
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading && url.trim() !== '') {
            onSend();
        }
    };
    return (_jsxs("div", { className: "flex-1", children: [_jsx("label", { htmlFor: "request-url-input", className: "sr-only", children: "Request URL" }), _jsx("input", { id: "request-url-input", type: "text", placeholder: "Enter request URL (e.g. {{BASE_URL}}/users or https://api.example.com/get)", value: url, onChange: (e) => setUrl(e.target.value), onKeyDown: handleKeyDown, disabled: isLoading, className: "w-full bg-surface-900/50 border border-surface-800 text-surface-100 placeholder-surface-500 rounded-r-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/20 disabled:opacity-60 transition" })] }));
}
//# sourceMappingURL=RequestUrlBar.js.map