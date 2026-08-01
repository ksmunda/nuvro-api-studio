import React, { useEffect } from 'react';
import { useRequestStore } from '../../store/request-store.js';
import type { AuthType } from '@nuvro/types';

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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authType]);

  const handleTypeChange = (newType: AuthType) => {
    setAuthType(newType);
    if (newType === 'NONE') {
      setAuthConfig({});
    } else if (newType === 'BEARER') {
      setAuthConfig({ token: '' });
    } else if (newType === 'BASIC') {
      setAuthConfig({ username: '', password: '' });
    } else if (newType === 'API_KEY') {
      setAuthConfig({ key: '', value: '', location: 'header', headerName: '' });
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    setAuthConfig({
      ...authConfig,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <label htmlFor="auth-type-select" className="text-sm font-medium text-surface-300 min-w-32">
          Auth Type
        </label>
        <select
          id="auth-type-select"
          value={authType}
          onChange={(e) => handleTypeChange(e.target.value as AuthType)}
          className="bg-surface-900 border border-surface-700 text-surface-100 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-sm focus:ring-1 focus:ring-brand-500/20"
        >
          <option value="NONE">No Auth</option>
          <option value="BEARER">Bearer Token</option>
          <option value="BASIC">Basic Auth</option>
          <option value="API_KEY">API Key</option>
        </select>
      </div>

      <div className="border-t border-surface-800/60 pt-4">
        {authType === 'NONE' && (
          <p className="text-sm text-surface-400">
            This request does not use any authentication credentials.
          </p>
        )}

        {authType === 'BEARER' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bearer-token-input" className="text-sm font-medium text-surface-300">
                Token
              </label>
              <input
                id="bearer-token-input"
                type="password"
                placeholder="Token"
                value={authConfig.token || ''}
                onChange={(e) => handleConfigChange('token', e.target.value)}
                className="w-full bg-surface-900 border border-surface-700 rounded px-3 py-1.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
          </div>
        )}

        {authType === 'BASIC' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="basic-username-input" className="text-sm font-medium text-surface-300">
                Username
              </label>
              <input
                id="basic-username-input"
                type="text"
                placeholder="Username"
                value={authConfig.username || ''}
                onChange={(e) => handleConfigChange('username', e.target.value)}
                className="w-full bg-surface-900 border border-surface-700 rounded px-3 py-1.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="basic-password-input" className="text-sm font-medium text-surface-300">
                Password
              </label>
              <input
                id="basic-password-input"
                type="password"
                placeholder="Password"
                value={authConfig.password || ''}
                onChange={(e) => handleConfigChange('password', e.target.value)}
                className="w-full bg-surface-900 border border-surface-700 rounded px-3 py-1.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
          </div>
        )}

        {authType === 'API_KEY' && (
          <div className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="api-key-key-input" className="text-sm font-medium text-surface-300">
                Key Name
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
                className="w-full bg-surface-900 border border-surface-700 rounded px-3 py-1.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="api-key-value-input" className="text-sm font-medium text-surface-300">
                Value
              </label>
              <input
                id="api-key-value-input"
                type="password"
                placeholder="Value"
                value={authConfig.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                className="w-full bg-surface-900 border border-surface-700 rounded px-3 py-1.5 text-sm text-surface-100 placeholder-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="api-key-location-select" className="text-sm font-medium text-surface-300">
                Add to
              </label>
              <select
                id="api-key-location-select"
                value={authConfig.location || 'header'}
                onChange={(e) => handleConfigChange('location', e.target.value)}
                className="bg-surface-900 border border-surface-700 text-surface-100 rounded px-3 py-1.5 focus:outline-none focus:border-brand-500 text-sm focus:ring-1 focus:ring-brand-500/20"
              >
                <option value="header">Header</option>
                <option value="query">Query Params</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
