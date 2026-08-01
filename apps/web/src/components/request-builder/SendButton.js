import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useRequestStore } from '../../store/request-store.js';
export function SendButton({ onSend }) {
    const { isLoading, cancelRequest, url } = useRequestStore();
    const handleAction = () => {
        if (isLoading) {
            cancelRequest();
        }
        else {
            onSend();
        }
    };
    const isDisabled = !isLoading && url.trim() === '';
    return (_jsx("button", { type: "button", onClick: handleAction, disabled: isDisabled, className: `px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all select-none min-w-28 flex items-center justify-center gap-2 ${isLoading
            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 shadow-glow-accent'
            : 'bg-brand-500 hover:bg-brand-400 text-surface-950 font-bold shadow-glow-brand disabled:opacity-50 disabled:cursor-not-allowed'}`, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "h-3.5 w-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" }), "Cancel"] })) : ('Send') }));
}
//# sourceMappingURL=SendButton.js.map