import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] ? [['github'], ['list'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'pnpm --filter @nuvro/web dev',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @nuvro/api dev',
      url: 'http://127.0.0.1:4000/api/v1/health',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
      env: {
        DATABASE_URL: process.env['DATABASE_URL'] ?? 'postgresql://nuvro:nuvro_dev_password@127.0.0.1:5432/nuvro_dev',
        PORT: '4000',
        ALLOW_PRIVATE_IPS: 'true',
      },
    },
  ],
});
