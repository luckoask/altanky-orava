import { defineConfig } from '@playwright/test';

const port = process.env.PLAYWRIGHT_PORT || '8000';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
    testDir: './tests/browser',
    outputDir: './artifacts/browser-tests',
    fullyParallel: false,
    workers: 1,
    forbidOnly: Boolean(process.env.CI),
    reporter: 'list',
    timeout: 30000,
    use: {
        baseURL,
        browserName: 'chromium',
        channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    webServer: {
        command: `php artisan serve --host=127.0.0.1 --port=${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
    },
});
