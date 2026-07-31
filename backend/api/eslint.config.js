import { baseConfig, boundaryConfig } from '@nuvro/config/eslint';

export default [
  ...baseConfig,
  boundaryConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
