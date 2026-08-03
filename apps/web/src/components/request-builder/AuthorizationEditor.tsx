import React, { useEffect } from 'react';
import { useRequestStore } from '../../store/request-store.js';
import type { AuthType } from '@nuvro/types';

type ExtendedAuthType = AuthType | 'JWT' | 'AWS' | 'HAWK' | 'NTLM';

export function AuthorizationEditor() {
  const { authType, authConfig, setAuthType, setAuthConfig } = useRequestStore();

  // Reset/initialise config when auth type changes
  useEffect(() => {
    if (Object.keys(authConfig).length === 0) {
      if (authType === 'BEARER') {
        setAuthConfig({ token: '' });
      } else if (authType === 'BASIC') {
        setAuthConfig({ username: '', password: '' });
      } else if (authType === 'API_KEY') {
        setAuthConfig({ key: '', value: '', location: 'header', headerName: '' });
      } else if (authType === 'OAUTH2') {
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

  const handleTypeChange = (newType: ExtendedAuthType) => {
    if (['AWS', 'HAWK', 'NTLM', 'DIGEST'].includes(newType)) {
      setAuthType(newType as AuthType);
      setAuthConfig({});
      return;
    }

    if (newType === 'JWT') {
      // Map to BEARER under the hood
      setAuthType('BEARER');
      setAuthConfig({ token: '', isJwt: true });
      return;
    }

    setAuthType(newType as AuthType);
    if (newType === 'NONE') {
      setAuthConfig({});
    } else if (newType === 'BEARER') {
      setAuthConfig({ token: '' });
    } else if (newType === 'BASIC') {
      setAuthConfig({ username: '', password: '' });
    } else if (newType === 'API_KEY') {
      setAuthConfig({ key: '', value: '', location: 'header', headerName: '' });
    } else if (newType === 'OAUTH2') {
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

  const handleConfigChange = (key: string, value: string) => {
    setAuthConfig({
      ...authConfig,
      [key]: value,
    });
  };

  // Determine displayed auth type
  let displayedType: ExtendedAuthType = authType;
  if (authType === 'BEARER' && authConfig.isJwt) {
    displayedType = 'JWT';
  }

  const selectClassName = "bg-surface-900 border border-surface-800 text-surface-200 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-xs focus:ring-1 focus:ring-brand-500/20";
  const inputClassName = "w-full bg-surface-950/80 border border-surface-800/80 rounded-lg px-3 py-2 text-xs text-surface-100 placeholder-surface-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 font-mono";
  const labelClassName = "block text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1.5";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <label htmlFor="auth-type-select" className="text-xs font-bold text-surface-300 min-w-32 uppercase tracking-wide">
          Authentication
        </label>
        <select
          id="auth-type-select"
          value={displayedType}
          onChange={(e) => handleTypeChange(e.target.value as ExtendedAuthType)}
          className={selectClassName}
        >
          <option value="NONE">No Auth</option>
          <option value="BEARER">Bearer Token</option>
          <option value="BASIC">Basic Auth</option>
          <option value="API_KEY">API Key</option>
          <option value="JWT">JWT Bearer</option>
          <option value="OAUTH2">OAuth 2.0</option>
          <option value="DIGEST">Digest Auth</option>
          <option value="AWS">AWS Signature</option>
          <option value="HAWK">Hawk Auth</option>
          <option value="NTLM">NTLM</option>
        </select>
      </div>

      <div className="border-t border-surface-800/60 pt-4">
        {displayedType === 'NONE' && (
          <p className="text-xs text-surface-450 italic">
            This request does not use any authentication credentials.
          </p>
        )}

        {displayedType === 'BEARER' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bearer-token-input" className={labelClassName}>
                Bearer Token
              </label>
              <input
                id="bearer-token-input"
                type="password"
                placeholder="Token (e.g. {{ACCESS_TOKEN}})"
                value={authConfig.token || ''}
                onChange={(e) => handleConfigChange('token', e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        )}

        {displayedType === 'JWT' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="jwt-token-input" className={labelClassName}>
                JWT Bearer Token
              </label>
              <input
                id="jwt-token-input"
                type="password"
                placeholder="JWT Token (e.g. {{JWT_TOKEN}})"
                value={authConfig.token || ''}
                onChange={(e) => handleConfigChange('token', e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        )}

        {displayedType === 'BASIC' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="basic-username-input" className={labelClassName}>
                Username
              </label>
              <input
                id="basic-username-input"
                type="text"
                placeholder="Username (e.g. {{USERNAME}})"
                value={authConfig.username || ''}
                onChange={(e) => handleConfigChange('username', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="basic-password-input" className={labelClassName}>
                Password
              </label>
              <input
                id="basic-password-input"
                type="password"
                placeholder="Password (e.g. {{PASSWORD}})"
                value={authConfig.password || ''}
                onChange={(e) => handleConfigChange('password', e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        )}

        {displayedType === 'API_KEY' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="api-key-key-input" className={labelClassName}>
                Key
              </label>
              <input
                id="api-key-key-input"
                type="text"
                placeholder="Key (e.g. X-API-Key)"
                value={authConfig.key || ''}
                onChange={(e) => {
                  handleConfigChange('key', e.target.value);
                  handleConfigChange('headerName', e.target.value);
                }}
                className={inputClassName}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="api-key-value-input" className={labelClassName}>
                Value
              </label>
              <input
                id="api-key-value-input"
                type="password"
                placeholder="Value (e.g. {{API_KEY}})"
                value={authConfig.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="api-key-location-select" className={labelClassName}>
                Add to
              </label>
              <select
                id="api-key-location-select"
                value={authConfig.location || 'header'}
                onChange={(e) => handleConfigChange('location', e.target.value)}
                className={selectClassName}
              >
                <option value="header">Header</option>
                <option value="query">Query Parameter</option>
                <option value="cookie">Cookie</option>
              </select>
            </div>
          </div>
        )}

        {displayedType === 'OAUTH2' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="oauth-grant-select" className={labelClassName}>
                Grant Type
              </label>
              <select
                id="oauth-grant-select"
                value={authConfig.grantType || 'client_credentials'}
                onChange={(e) => handleConfigChange('grantType', e.target.value)}
                className={selectClassName}
              >
                <option value="client_credentials">Client Credentials</option>
                <option value="authorization_code">Authorization Code</option>
                <option value="password">Password</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="oauth-client-id" className={labelClassName}>
                  Client ID
                </label>
                <input
                  id="oauth-client-id"
                  type="text"
                  placeholder="Client ID"
                  value={authConfig.clientId || ''}
                  onChange={(e) => handleConfigChange('clientId', e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="oauth-client-secret" className={labelClassName}>
                  Client Secret
                </label>
                <input
                  id="oauth-client-secret"
                  type="password"
                  placeholder="Client Secret"
                  value={authConfig.clientSecret || ''}
                  onChange={(e) => handleConfigChange('clientSecret', e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="oauth-token-url" className={labelClassName}>
                Access Token URL
              </label>
              <input
                id="oauth-token-url"
                type="text"
                placeholder="https://example.com/oauth/token"
                value={authConfig.tokenUrl || ''}
                onChange={(e) => handleConfigChange('tokenUrl', e.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="oauth-access-token" className={labelClassName}>
                Access Token
              </label>
              <input
                id="oauth-access-token"
                type="password"
                placeholder="Access Token (e.g. {{OAUTH_TOKEN}})"
                value={authConfig.accessToken || ''}
                onChange={(e) => handleConfigChange('accessToken', e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>
        )}

        {['DIGEST', 'AWS', 'HAWK', 'NTLM'].includes(displayedType as string) && (
          <div className="rounded-lg bg-yellow-500/10 p-3.5 border border-yellow-500/20 text-xs text-yellow-400 font-medium">
            ⚠️ {(displayedType as string) === 'DIGEST' ? 'Digest Auth' : (displayedType as string) === 'AWS' ? 'AWS Signature' : (displayedType as string) === 'HAWK' ? 'Hawk Auth' : 'NTLM'} is not supported in the current run.
          </div>
        )}
      </div>
    </div>
  );
}
