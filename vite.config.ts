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

    // CSP rollout mirrors production (config/nginx.conf.erb):
    //   1. The permissive policy is ENFORCED so local dev is unaffected.
    //   2. The tightened policy (`strictCsp`) is always sent as Content-Security-Policy-Report-Only
    //      so violations surface as browser-console warnings during dev. Setting
    //      VITE_CSP_REPORT_URI additionally POSTs those reports to that endpoint (e.g. a Sentry
    //      security endpoint), which is how you exercise report ingestion locally.
    // Notes on the tightened policy: `unsafe-inline` stays because Vite's runtime and
    // MUI/emotion inject inline scripts/styles; img-src/media-src stay broad because chat
    // renders WhatsApp media from arbitrary external CDNs; `unsafe-eval` is required by the
    // flow editor (@nyaruka/temba-components uses `new Function(...)`).
    const enforcedCsp =
      "default-src * data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; script-src-elem 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://js.stripe.com https://*.posthog.com https://moonshine.projecttech4dev.org; frame-src 'self' https://js.stripe.com/ https://www.google.com https://www.canva.com https://www.gstatic.com https://www.youtube.com https://moonshine.projecttech4dev.org/ data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src *;";
    const cspReportUri = env.VITE_CSP_REPORT_URI;
    const strictCsp =
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; script-src-elem 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://js.stripe.com https://*.posthog.com https://moonshine.projecttech4dev.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; frame-src 'self' https://js.stripe.com https://www.google.com https://www.canva.com https://www.gstatic.com https://www.youtube.com https://moonshine.projecttech4dev.org data:; worker-src 'self' blob:; connect-src 'self' https://glific.test:* wss://glific.test:* https://api.glific.test:* wss://api.glific.test:* http://localhost:* ws://localhost:* https://*.posthog.com https://*.i.posthog.com https://moonshine.projecttech4dev.org https://*.sentry.io https://*.ingest.sentry.io https://api.stripe.com https://www.google.com https://cors-anywhere.tides.coloredcow.com https://storage.googleapis.com; object-src 'none'; base-uri 'self';";

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
          'Content-Security-Policy': enforcedCsp,
          ...(cspReportUri
            ? {
                'Reporting-Endpoints': `csp-endpoint="${cspReportUri}"`,
                'Content-Security-Policy-Report-Only': `${strictCsp} report-to csp-endpoint; report-uri ${cspReportUri};`,
              }
            : { 'Content-Security-Policy-Report-Only': strictCsp }),
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
