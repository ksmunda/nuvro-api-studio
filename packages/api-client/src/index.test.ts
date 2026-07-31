import { describe, it, expect } from 'vitest';
import { ApiClient } from './index.js';

describe('ApiClient exports', () => {
  it('exports ApiClient class', () => {
    expect(ApiClient).toBeDefined();
  });
});
