import { baseConfig, reactConfig, boundaryConfig } from '@nuvro/config/eslint';

export default [
  ...baseConfig,
  boundaryConfig,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/build/**',
      '**/coverage/**',
      'database/prisma/generated/**',
    ],
  },
];
