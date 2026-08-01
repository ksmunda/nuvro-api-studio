import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useRequestStore } from '../../store/request-store.js';
export function AuthorizationEditor() {
    const { authType, authConfig, setAuthType, setAuthConfig } = useRequestStore();
    // Reset/initialise config when auth type changes
    useEffect(() => {
        if (Object.keys(authConfig).length === 0) {
            if (authType === 'BEARER') {
                setAuthConfig({ token: '' });
            }
            else if (authType === 'BASIC') {
                setAuthConfig({ username: '', password: '' });
            }
            else if (authType === 'API_KEY') {
                setAuthConfig({ key: '', value: '', location: 'header', headerName: '' });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authType]);
    const handleTypeChange = (newType) => {
        setAuthType(newType);
        if (newType === 'NONE') {
            setAuthConfig({});
        }
        else if (newType === 'BEARER') {
            setAuthConfig({ token: '' });
        }
        else if (newType === 'BASIC') {
            setAuthConfig({ username: '', password: '' });
        }
        else if (newType === 'API_KEY') {
            setAuthConfig({ key: '', value: '', location: 'header', headerName: '' });
        }
    };
    const handleConfigChange = (key, value) => {
        setAuthConfig({
            ...authConfig,
            [key]: value,
        });
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-start md:items-center", children: [_jsx("label", { htmlFor: "auth-type-select", className: "text-sm font-medium text-surface-300 min-w-32", children: "Auth Type" }), _jsxs("select", { id: "auth-type-select", value: authType, onChange: (e) => handleTypeChange(e.target.value), className: "bg-surface-900 border border-surface-700 text-surface-100 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-sm focus:ring-1 focus:ring-brand-500/20", children: [_jsx("option", { value: "NONE", children: "No Auth" }), _jsx("option", { value: "BEARER", children: "Bearer Token" }), _jsx("option", { value: "BASIC", children: "Basic Auth" }), _jsx("option", { value: "API_KEY", children: "API Key" })] })] }), _jsxs("div", { className: "border-t border-surface-800/60 pt-4", children: [authType === 'NONE' && (_jsx("p", { className: "text-sm text-surface-400", children: "This request does not use any authentication credentials." })), authType === 'BEARER' && (_jsx("div", { className: "space-y-4 max-w-lg", children: _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "bearer-token-input", className: "text-sm font-medium text-surface-300", children: "Token" }), _jsx("input", { id: "bearer-token-input", type: "password", placeholder: "Token", value: authConfig.token || '', onChange: (e) => handleConfigChange('token', e.target.value), className: "w-full bg-surface-900 border border-surface-700 rounded px-3 py-1.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20" })] }) })), authType === 'BASIC' && (_jsxs("div", { className: "space-y-4 max-w-lg", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "basic-username-input", className: "text-sm font-medium text-surface-300", children: "Username" }), _jsx("input", { id: "basic-username-input", type: "text", placeholder: "Username", value: authConfig.username || '', onChange: (e) => handleConfigChange('username', e.target.value), className: "w-full bg-surface-900 border border-surface-700 rounded px-3 py-1.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20" })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "basic-password-input", className: "text-sm font-medium text-surface-300", children: "Password" }), _jsx("input", { id: "basic-password-input", type: "password", placeholder: "Password", value: authConfig.password || '', onChange: (e) => handleConfigChange('password', e.target.value), className: "w-full bg-surface-900 border border-surface-700 rounded px-3 py-1.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20" })] })] })), authType === 'API_KEY' && (_jsxs("div", { className: "space-y-4 max-w-lg", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "api-key-key-input", className: "text-sm font-medium text-surface-300", children: "Key Name" }), _jsx("input", { id: "api-key-key-input", type: "text", placeholder: "Key (e.g. X-API-Key)", value: authConfig.key || '', onChange: (e) => {
                                            handleConfigChange('key', e.target.value);
                                            handleConfigChange('headerName', e.target.value);
                                        }, className: "w-full bg-surface-900 border border-surface-700 rounded px-3 py-1.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20" })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "api-key-value-input", className: "text-sm font-medium text-surface-300", children: "Value" }), _jsx("input", { id: "api-key-value-input", type: "password", placeholder: "Value", value: authConfig.value || '', onChange: (e) => handleConfigChange('value', e.target.value), className: "w-full bg-surface-900 border border-surface-700 rounded px-3 py-1.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20" })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "api-key-location-select", className: "text-sm font-medium text-surface-300", children: "Add to" }), _jsxs("select", { id: "api-key-location-select", value: authConfig.location || 'header', onChange: (e) => handleConfigChange('location', e.target.value), className: "bg-surface-900 border border-surface-700 text-surface-100 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-sm focus:ring-1 focus:ring-brand-500/20", children: [_jsx("option", { value: "header", children: "Header" }), _jsx("option", { value: "query", children: "Query Params" })] })] })] }))] })] }));
}
//# sourceMappingURL=AuthorizationEditor.js.map