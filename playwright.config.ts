import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'export PATH=/tmp/node-v22.23.3-linux-x64/bin:$PATH && npm run build && npm run preview -- --host 127.0.0.1',
		port: 4173,
		reuseExistingServer: false
	},
	testDir: 'tests/e2e',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
