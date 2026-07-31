import { describe, it, expect } from 'vitest';
import { interpolateVariables, extractVariableNames } from './index.js';

describe('interpolateVariables', () => {
  it('replaces a single variable', () => {
    expect(
      interpolateVariables('{{baseUrl}}/users', { baseUrl: 'https://api.example.com' }),
    ).toBe('https://api.example.com/users');
  });

  it('replaces multiple variables', () => {
    expect(
      interpolateVariables('{{baseUrl}}/users/{{userId}}', {
        baseUrl: 'https://api.example.com',
        userId: '42',
      }),
    ).toBe('https://api.example.com/users/42');
  });

  it('leaves unresolved variables intact', () => {
    expect(interpolateVariables('{{baseUrl}}/users', {})).toBe('{{baseUrl}}/users');
  });

  it('handles trimmed whitespace inside braces', () => {
    expect(
      interpolateVariables('{{ baseUrl }}/test', { baseUrl: 'https://api.example.com' }),
    ).toBe('https://api.example.com/test');
  });

  it('returns empty string unchanged', () => {
    expect(interpolateVariables('', {})).toBe('');
  });

  it('handles a string with no variables', () => {
    expect(interpolateVariables('https://api.example.com', { baseUrl: 'x' })).toBe(
      'https://api.example.com',
    );
  });
});

describe('extractVariableNames', () => {
  it('extracts a single variable name', () => {
    expect(extractVariableNames('{{baseUrl}}/users')).toEqual(['baseUrl']);
  });

  it('extracts multiple unique variable names', () => {
    expect(
      extractVariableNames('{{baseUrl}}/users/{{userId}}/posts/{{userId}}'),
    ).toEqual(['baseUrl', 'userId']);
  });

  it('returns empty array for strings with no variables', () => {
    expect(extractVariableNames('https://api.example.com/users')).toEqual([]);
  });
});
