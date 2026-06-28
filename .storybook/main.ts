import type { StorybookConfig } from '@storybook/react-vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',
  // allow tunneled hosts (e.g. ngrok) — this is Storybook's own host guard,
  // separate from Vite's server.allowedHosts below
  core: { allowedHosts: true },
  viteFinal(config) {
    config.plugins = [...(config.plugins || []), viteTsconfigPaths(), svgr()];
    config.server = { ...config.server, allowedHosts: true };
    return config;
  },
};

export default config;
