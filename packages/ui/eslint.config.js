import { reactConfig, boundaryConfig } from '@nuvro/config/eslint';

export default [
  ...reactConfig,
  boundaryConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
