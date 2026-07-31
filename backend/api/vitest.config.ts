import { createVitestConfig } from '@nuvro/config/vitest';

export default createVitestConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
