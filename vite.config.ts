/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />
import react from '@vitejs/plugin-react';
import { ConfigEnv, PluginOption, UserConfigExport, defineConfig, loadEnv } from 'vite';
// import eslint from 'vite-plugin-eslint';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default async ({ command, mode }: ConfigEnv): Promise<UserConfigExport> => {
  const env = loadEnv(mode, process.cwd(), '');

  const isBuild = command === 'build';
  const enableSentry = isBuild && !!env.VITE_SENTRY_AUTH_TOKEN;

  const plugins: PluginOption[] = [
    react(),
    viteTsconfigPaths(),
    svgr(),
    ...(enableSentry
      ? [
          sentryVitePlugin({
            authToken: env.VITE_SENTRY_AUTH_TOKEN,
            org: 'project-tech4dev',
            project: 'glific-frontend',
            telemetry: false,
          }),
        ]
      : []),
  ];

  const esbuildOptions = {
    // Node.js global to browser globalThis
    define: {
      global: 'globalThis',
    },
  };

  // dev in test mode config
  if (mode === 'test' && command === 'serve') {
    return defineConfig({
      // dev specific config
      build: {
        sourcemap: true, // Source map generation must be turned on
      },
      plugins,
      optimizeDeps: { esbuildOptions },
    });
  }

  // dev specific config
  if (command === 'serve') {
    // mkcert is a devDependency used only for the local HTTPS dev server; import it
    // lazily so production builds (which don't install devDependencies) never resolve it.
    const { default: mkcert } = await import('vite-plugin-mkcert');
    return defineConfig({
      plugins: plugins.concat([checker({ typescript: true }), mkcert({ hosts: ['glific.test'] })]),
      // dev specific config
      build: {
        sourcemap: true, // Source map generation must be turned on
      },
      optimizeDeps: { esbuildOptions },
      server: {
        host: 'glific.test',
        port: 3000,
        open: 'https://glific.test:3000/',
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'X-Frame-Options': 'deny',
          'Content-Security-Policy':
            "default-src * data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; script-src-elem 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://js.stripe.com https://*.posthog.com https://moonshine.projecttech4dev.org; frame-src 'self' https://js.stripe.com/ https://www.google.com https://www.canva.com https://www.gstatic.com https://www.youtube.com https://moonshine.projecttech4dev.org/ data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src *;",
          'Strict-Transport-Security': 'max-age=63072000; includeSubdomains; preload',
        },
      },
    });
  }

  // command === 'build'
  return defineConfig({
    plugins,
    optimizeDeps: { esbuildOptions },
    build: {
      outDir: 'build',
      sourcemap: enableSentry,
      rollupOptions: {
        output: {
          // Use stable (hash-free) filenames so chunk URLs remain valid across deployments.
          // Browsers must be served these files with Cache-Control: no-cache to always
          // receive the latest version. Without hashes, old app instances can still
          // dynamically import Login.js (etc.) after a new deploy instead of getting a 404.
          chunkFileNames: 'assets/[name].js',
          entryFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
          manualChunks: {
            react: ['react', 'react-dom'],
            apollo: ['@apollo/client'],
            mui: ['@mui/material', '@mui/icons-material', '@mui/x-date-pickers'],
            sentry: ['@sentry/react'],
            vendor: ['dayjs', 'uuid', 'axios'],
          },
        },
      },
    },
  });
};
