import { reactConfig, boundaryConfig } from '@nuvro/config/eslint';

export default [
  ...reactConfig,
  boundaryConfig,
  {
    ignores: ['dist/**', 'node_modules/**', 'src/**/*.d.ts', 'src/**/*.js', 'src/**/*.js.map', 'src/**/*.d.ts.map'],
  },
];
