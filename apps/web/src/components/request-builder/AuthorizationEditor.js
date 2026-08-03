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
            else if (authType === 'OAUTH2') {
                setAuthConfig({
                    grantType: 'client_credentials',
                    clientId: '',
                    clientSecret: '',
                    tokenUrl: '',
                    authorizationUrl: '',
                    scope: '',
                    accessToken: '',
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authType]);
    const handleTypeChange = (newType) => {
        if (['AWS', 'HAWK', 'NTLM', 'DIGEST'].includes(newType)) {
            setAuthType(newType);
            setAuthConfig({});
            return;
        }
        if (newType === 'JWT') {
            // Map to BEARER under the hood
            setAuthType('BEARER');
            setAuthConfig({ token: '', isJwt: true });
            return;
        }
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
        else if (newType === 'OAUTH2') {
            setAuthConfig({
                grantType: 'client_credentials',
                clientId: '',
                clientSecret: '',
                tokenUrl: '',
                authorizationUrl: '',
                scope: '',
                accessToken: '',
            });
        }
    };
    const handleConfigChange = (key, value) => {
        setAuthConfig({
            ...authConfig,
            [key]: value,
        });
    };
    // Determine displayed auth type
    let displayedType = authType;
    if (authType === 'BEARER' && authConfig.isJwt) {
        displayedType = 'JWT';
    }
    const selectClassName = "bg-surface-900 border border-surface-800 text-surface-200 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-xs focus:ring-1 focus:ring-brand-500/20";
    const inputClassName = "w-full bg-surface-950/80 border border-surface-800/80 rounded-lg px-3 py-2 text-xs text-surface-100 placeholder-surface-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 font-mono";
    const labelClassName = "block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5";
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4", children: [_jsx("label", { htmlFor: "auth-type-select", className: "text-xs font-bold text-surface-300 min-w-32 uppercase tracking-wide", children: "Authentication" }), _jsxs("select", { id: "auth-type-select", value: displayedType, onChange: (e) => handleTypeChange(e.target.value), className: selectClassName, children: [_jsx("option", { value: "NONE", children: "No Auth" }), _jsx("option", { value: "BEARER", children: "Bearer Token" }), _jsx("option", { value: "BASIC", children: "Basic Auth" }), _jsx("option", { value: "API_KEY", children: "API Key" }), _jsx("option", { value: "JWT", children: "JWT Bearer" }), _jsx("option", { value: "OAUTH2", children: "OAuth 2.0" }), _jsx("option", { value: "DIGEST", children: "Digest Auth" }), _jsx("option", { value: "AWS", children: "AWS Signature" }), _jsx("option", { value: "HAWK", children: "Hawk Auth" }), _jsx("option", { value: "NTLM", children: "NTLM" })] })] }), _jsxs("div", { className: "border-t border-surface-800/60 pt-4", children: [displayedType === 'NONE' && (_jsx("p", { className: "text-xs text-surface-450 italic", children: "This request does not use any authentication credentials." })), displayedType === 'BEARER' && (_jsx("div", { className: "space-y-4 max-w-lg", children: _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "bearer-token-input", className: labelClassName, children: "Bearer Token" }), _jsx("input", { id: "bearer-token-input", type: "password", placeholder: "Token (e.g. {{ACCESS_TOKEN}})", value: authConfig.token || '', onChange: (e) => handleConfigChange('token', e.target.value), className: inputClassName })] }) })), displayedType === 'JWT' && (_jsx("div", { className: "space-y-4 max-w-lg", children: _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "jwt-token-input", className: labelClassName, children: "JWT Bearer Token" }), _jsx("input", { id: "jwt-token-input", type: "password", placeholder: "JWT Token (e.g. {{JWT_TOKEN}})", value: authConfig.token || '', onChange: (e) => handleConfigChange('token', e.target.value), className: inputClassName })] }) })), displayedType === 'BASIC' && (_jsxs("div", { className: "space-y-4 max-w-lg", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "basic-username-input", className: labelClassName, children: "Username" }), _jsx("input", { id: "basic-username-input", type: "text", placeholder: "Username (e.g. {{USERNAME}})", value: authConfig.username || '', onChange: (e) => handleConfigChange('username', e.target.value), className: inputClassName })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "basic-password-input", className: labelClassName, children: "Password" }), _jsx("input", { id: "basic-password-input", type: "password", placeholder: "Password (e.g. {{PASSWORD}})", value: authConfig.password || '', onChange: (e) => handleConfigChange('password', e.target.value), className: inputClassName })] })] })), displayedType === 'API_KEY' && (_jsxs("div", { className: "space-y-4 max-w-lg", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "api-key-key-input", className: labelClassName, children: "Key" }), _jsx("input", { id: "api-key-key-input", type: "text", placeholder: "Key (e.g. X-API-Key)", value: authConfig.key || '', onChange: (e) => {
                                            handleConfigChange('key', e.target.value);
                                            handleConfigChange('headerName', e.target.value);
                                        }, className: inputClassName })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "api-key-value-input", className: labelClassName, children: "Value" }), _jsx("input", { id: "api-key-value-input", type: "password", placeholder: "Value (e.g. {{API_KEY}})", value: authConfig.value || '', onChange: (e) => handleConfigChange('value', e.target.value), className: inputClassName })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "api-key-location-select", className: labelClassName, children: "Add to" }), _jsxs("select", { id: "api-key-location-select", value: authConfig.location || 'header', onChange: (e) => handleConfigChange('location', e.target.value), className: selectClassName, children: [_jsx("option", { value: "header", children: "Header" }), _jsx("option", { value: "query", children: "Query Parameter" }), _jsx("option", { value: "cookie", children: "Cookie" })] })] })] })), displayedType === 'OAUTH2' && (_jsxs("div", { className: "space-y-4 max-w-lg", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "oauth-grant-select", className: labelClassName, children: "Grant Type" }), _jsxs("select", { id: "oauth-grant-select", value: authConfig.grantType || 'client_credentials', onChange: (e) => handleConfigChange('grantType', e.target.value), className: selectClassName, children: [_jsx("option", { value: "client_credentials", children: "Client Credentials" }), _jsx("option", { value: "authorization_code", children: "Authorization Code" }), _jsx("option", { value: "password", children: "Password" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "oauth-client-id", className: labelClassName, children: "Client ID" }), _jsx("input", { id: "oauth-client-id", type: "text", placeholder: "Client ID", value: authConfig.clientId || '', onChange: (e) => handleConfigChange('clientId', e.target.value), className: inputClassName })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "oauth-client-secret", className: labelClassName, children: "Client Secret" }), _jsx("input", { id: "oauth-client-secret", type: "password", placeholder: "Client Secret", value: authConfig.clientSecret || '', onChange: (e) => handleConfigChange('clientSecret', e.target.value), className: inputClassName })] })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "oauth-token-url", className: labelClassName, children: "Access Token URL" }), _jsx("input", { id: "oauth-token-url", type: "text", placeholder: "https://example.com/oauth/token", value: authConfig.tokenUrl || '', onChange: (e) => handleConfigChange('tokenUrl', e.target.value), className: inputClassName })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { htmlFor: "oauth-access-token", className: labelClassName, children: "Access Token" }), _jsx("input", { id: "oauth-access-token", type: "password", placeholder: "Access Token (e.g. {{OAUTH_TOKEN}})", value: authConfig.accessToken || '', onChange: (e) => handleConfigChange('accessToken', e.target.value), className: inputClassName })] })] })), ['DIGEST', 'AWS', 'HAWK', 'NTLM'].includes(displayedType) && (_jsxs("div", { className: "rounded-lg bg-yellow-500/10 p-3.5 border border-yellow-500/20 text-xs text-yellow-400 font-medium", children: ["\u26A0\uFE0F ", displayedType === 'DIGEST' ? 'Digest Auth' : displayedType === 'AWS' ? 'AWS Signature' : displayedType === 'HAWK' ? 'Hawk Auth' : 'NTLM', " is not supported in the current run."] }))] })] }));
}
//# sourceMappingURL=AuthorizationEditor.js.map