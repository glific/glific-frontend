import type { StorybookConfig } from '@storybook/react-vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

// Only allow explicitly listed tunnel hostnames (e.g. ngrok) via env, so host
// validation / DNS-rebinding protection stays on by default.
// Set STORYBOOK_ALLOWED_HOSTS to a comma-separated list, e.g. "abc123.ngrok.io".
const allowedHosts = process.env.STORYBOOK_ALLOWED_HOSTS
  ? process.env.STORYBOOK_ALLOWED_HOSTS.split(',').map((host) => host.trim())
  : undefined;

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-mcp'],
  framework: '@storybook/react-vite',
  // Storybook's own host guard, separate from Vite's server.allowedHosts below.
  // Only the explicitly allowed tunnel hosts (if any) are permitted.
  ...(allowedHosts ? { core: { allowedHosts } } : {}),
  viteFinal(config) {
    config.plugins = [...(config.plugins || []), viteTsconfigPaths(), svgr()];
    if (allowedHosts) {
      config.server = { ...config.server, allowedHosts };
    }
    return config;
  },
};

export default config;
