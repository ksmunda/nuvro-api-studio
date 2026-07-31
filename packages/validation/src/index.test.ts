import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Validation exports', () => {
  it('exports zod instance', () => {
    expect(z).toBeDefined();
  });
});
