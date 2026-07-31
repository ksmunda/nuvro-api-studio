import { createVitestConfig } from '@nuvro/config/vitest';
import path from 'path';

export default createVitestConfig({
  resolve: {
    alias: {
      '@nuvro/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@nuvro/validation': path.resolve(__dirname, '../../packages/validation/src/index.ts'),
      '@nuvro/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
