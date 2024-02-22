var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { defineConfig } from "file:///Users/akansha/Desktop/glific3/glific-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///Users/akansha/Desktop/glific3/glific-frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import viteTsconfigPaths from "file:///Users/akansha/Desktop/glific3/glific-frontend/node_modules/vite-tsconfig-paths/dist/index.mjs";
import checker from "file:///Users/akansha/Desktop/glific3/glific-frontend/node_modules/vite-plugin-checker/dist/esm/main.js";
import svgrPlugin from "file:///Users/akansha/Desktop/glific3/glific-frontend/node_modules/vite-plugin-svgr/dist/index.js";
import fs from "fs";
import nodePolyfills from "file:///Users/akansha/Desktop/glific3/glific-frontend/node_modules/rollup-plugin-polyfill-node/dist/index.js";
var vite_config_default = ({ command, mode }) => {
  if (mode === "test" && command === "serve") {
    return defineConfig({
      // dev specific config
      plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
      optimizeDeps: {
        esbuildOptions: {
          // Node.js global to browser globalThis
          define: {
            global: "globalThis"
          }
        }
      },
      resolve: { alias: { util: "util/" } },
      test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/setupTests.ts",
        coverage: {
          reporter: ["text", "html", "lcov"],
          // choosing istanbul for now because of this https://github.com/vitest-dev/vitest/issues/1252
          provider: "istanbul",
          // or 'c8'
          exclude: ["node_modules/", "**/*.test.tsx"]
        },
        css: true
      }
    });
  }
  if (command === "serve") {
    return defineConfig({
      // dev specific config
      plugins: [react(), viteTsconfigPaths(), svgrPlugin(), checker({ typescript: true })],
      optimizeDeps: {
        esbuildOptions: {
          // Node.js global to browser globalThis
          define: {
            global: "globalThis"
          }
        }
      },
      server: {
        open: true,
        port: 3e3,
        https: {
          key: fs.readFileSync("../glific/priv/cert/glific.test+1-key.pem"),
          cert: fs.readFileSync("../glific/priv/cert/glific.test+1.pem")
        },
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-XSS-Protection": "1; mode=block",
          "X-Frame-Options": "deny",
          "Content-Security-Policy": "default-src * data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; script-src-elem 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; frame-src 'self' https://www.google.com https://www.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src *;",
          "Strict-Transport-Security": "max-age=63072000; includeSubdomains; preload"
        }
      },
      resolve: { alias: { util: "util/", stream: "stream-browserify" } }
      // stream polyfill is needed by logflare
    });
  }
  return defineConfig({
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis"
        }
      }
    },
    // build specific config
    plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
    build: {
      // this is needed because of this https://github.com/vitejs/vite/issues/2139#issuecomment-1405624744
      commonjsOptions: {
        defaultIsModuleExports(id) {
          try {
            const module = __require(id);
            if (module?.default) {
              return false;
            }
            return "auto";
          } catch (error) {
            return "auto";
          }
        },
        transformMixedEsModules: true
      },
      outDir: "build",
      rollupOptions: {
        plugins: [nodePolyfills("buffer", "process")]
      }
    },
    resolve: { alias: { util: "util/", stream: "stream-browserify" } }
  });
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWthbnNoYS9EZXNrdG9wL2dsaWZpYzMvZ2xpZmljLWZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWthbnNoYS9EZXNrdG9wL2dsaWZpYzMvZ2xpZmljLWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9ha2Fuc2hhL0Rlc2t0b3AvZ2xpZmljMy9nbGlmaWMtZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGUtcGx1Z2luLXN2Z3IvY2xpZW50XCIgLz5cbmltcG9ydCB7IGRlZmluZUNvbmZpZywgQ29uZmlnRW52LCBVc2VyQ29uZmlnRXhwb3J0IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuLy8gaW1wb3J0IGVzbGludCBmcm9tICd2aXRlLXBsdWdpbi1lc2xpbnQnO1xuaW1wb3J0IHZpdGVUc2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xuaW1wb3J0IGNoZWNrZXIgZnJvbSAndml0ZS1wbHVnaW4tY2hlY2tlcic7XG5pbXBvcnQgc3ZnclBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1zdmdyJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgbm9kZVBvbHlmaWxscyBmcm9tICdyb2xsdXAtcGx1Z2luLXBvbHlmaWxsLW5vZGUnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgKHsgY29tbWFuZCwgbW9kZSB9OiBDb25maWdFbnYpOiBVc2VyQ29uZmlnRXhwb3J0ID0+IHtcbiAgaWYgKG1vZGUgPT09ICd0ZXN0JyAmJiBjb21tYW5kID09PSAnc2VydmUnKSB7XG4gICAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XG4gICAgICAvLyBkZXYgc3BlY2lmaWMgY29uZmlnXG4gICAgICBwbHVnaW5zOiBbcmVhY3QoKSwgdml0ZVRzY29uZmlnUGF0aHMoKSwgc3ZnclBsdWdpbigpXSxcblxuICAgICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgICAgLy8gTm9kZS5qcyBnbG9iYWwgdG8gYnJvd3NlciBnbG9iYWxUaGlzXG4gICAgICAgICAgZGVmaW5lOiB7XG4gICAgICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcblxuICAgICAgcmVzb2x2ZTogeyBhbGlhczogeyB1dGlsOiAndXRpbC8nIH0gfSxcbiAgICAgIHRlc3Q6IHtcbiAgICAgICAgZ2xvYmFsczogdHJ1ZSxcbiAgICAgICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgICAgIHNldHVwRmlsZXM6ICcuL3NyYy9zZXR1cFRlc3RzLnRzJyxcbiAgICAgICAgY292ZXJhZ2U6IHtcbiAgICAgICAgICByZXBvcnRlcjogWyd0ZXh0JywgJ2h0bWwnLCAnbGNvdiddLFxuICAgICAgICAgIC8vIGNob29zaW5nIGlzdGFuYnVsIGZvciBub3cgYmVjYXVzZSBvZiB0aGlzIGh0dHBzOi8vZ2l0aHViLmNvbS92aXRlc3QtZGV2L3ZpdGVzdC9pc3N1ZXMvMTI1MlxuICAgICAgICAgIHByb3ZpZGVyOiAnaXN0YW5idWwnLCAvLyBvciAnYzgnXG4gICAgICAgICAgZXhjbHVkZTogWydub2RlX21vZHVsZXMvJywgJyoqLyoudGVzdC50c3gnXSxcbiAgICAgICAgfSxcbiAgICAgICAgY3NzOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuICBpZiAoY29tbWFuZCA9PT0gJ3NlcnZlJykge1xuICAgIHJldHVybiBkZWZpbmVDb25maWcoe1xuICAgICAgLy8gZGV2IHNwZWNpZmljIGNvbmZpZ1xuICAgICAgcGx1Z2luczogW3JlYWN0KCksIHZpdGVUc2NvbmZpZ1BhdGhzKCksIHN2Z3JQbHVnaW4oKSwgY2hlY2tlcih7IHR5cGVzY3JpcHQ6IHRydWUgfSldLFxuICAgICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgICAgLy8gTm9kZS5qcyBnbG9iYWwgdG8gYnJvd3NlciBnbG9iYWxUaGlzXG4gICAgICAgICAgZGVmaW5lOiB7XG4gICAgICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHNlcnZlcjoge1xuICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICBwb3J0OiAzMDAwLFxuICAgICAgICBodHRwczoge1xuICAgICAgICAgIGtleTogZnMucmVhZEZpbGVTeW5jKCcuLi9nbGlmaWMvcHJpdi9jZXJ0L2dsaWZpYy50ZXN0KzEta2V5LnBlbScpLFxuICAgICAgICAgIGNlcnQ6IGZzLnJlYWRGaWxlU3luYygnLi4vZ2xpZmljL3ByaXYvY2VydC9nbGlmaWMudGVzdCsxLnBlbScpLFxuICAgICAgICB9LFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1gtQ29udGVudC1UeXBlLU9wdGlvbnMnOiAnbm9zbmlmZicsXG4gICAgICAgICAgJ1gtWFNTLVByb3RlY3Rpb24nOiAnMTsgbW9kZT1ibG9jaycsXG4gICAgICAgICAgJ1gtRnJhbWUtT3B0aW9ucyc6ICdkZW55JyxcbiAgICAgICAgICAnQ29udGVudC1TZWN1cml0eS1Qb2xpY3knOlxuICAgICAgICAgICAgXCJkZWZhdWx0LXNyYyAqIGRhdGE6OyBzY3JpcHQtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJyBibG9iOjsgc2NyaXB0LXNyYy1lbGVtICdzZWxmJyAndW5zYWZlLWlubGluZScgaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbSBodHRwczovL3d3dy5nc3RhdGljLmNvbTsgZnJhbWUtc3JjICdzZWxmJyBodHRwczovL3d3dy5nb29nbGUuY29tIGh0dHBzOi8vd3d3LmdzdGF0aWMuY29tIGRhdGE6OyBzdHlsZS1zcmMgJ3NlbGYnICd1bnNhZmUtaW5saW5lJyBodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tOyBmb250LXNyYyAnc2VsZicgZGF0YTogaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbTsgY29ubmVjdC1zcmMgKjtcIixcbiAgICAgICAgICAnU3RyaWN0LVRyYW5zcG9ydC1TZWN1cml0eSc6ICdtYXgtYWdlPTYzMDcyMDAwOyBpbmNsdWRlU3ViZG9tYWluczsgcHJlbG9hZCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcmVzb2x2ZTogeyBhbGlhczogeyB1dGlsOiAndXRpbC8nLCBzdHJlYW06ICdzdHJlYW0tYnJvd3NlcmlmeScgfSB9LCAvLyBzdHJlYW0gcG9seWZpbGwgaXMgbmVlZGVkIGJ5IGxvZ2ZsYXJlXG4gICAgfSk7XG4gIH1cbiAgLy8gY29tbWFuZCA9PT0gJ2J1aWxkJ1xuICByZXR1cm4gZGVmaW5lQ29uZmlnKHtcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgIC8vIE5vZGUuanMgZ2xvYmFsIHRvIGJyb3dzZXIgZ2xvYmFsVGhpc1xuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBidWlsZCBzcGVjaWZpYyBjb25maWdcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgdml0ZVRzY29uZmlnUGF0aHMoKSwgc3ZnclBsdWdpbigpXSxcbiAgICBidWlsZDoge1xuICAgICAgLy8gdGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBvZiB0aGlzIGh0dHBzOi8vZ2l0aHViLmNvbS92aXRlanMvdml0ZS9pc3N1ZXMvMjEzOSNpc3N1ZWNvbW1lbnQtMTQwNTYyNDc0NFxuICAgICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICAgIGRlZmF1bHRJc01vZHVsZUV4cG9ydHMoaWQpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gcmVxdWlyZShpZCk7XG4gICAgICAgICAgICBpZiAobW9kdWxlPy5kZWZhdWx0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnYXV0byc7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiAnYXV0byc7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBvdXREaXI6ICdidWlsZCcsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIHBsdWdpbnM6IFtub2RlUG9seWZpbGxzKCdidWZmZXInLCAncHJvY2VzcycpXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByZXNvbHZlOiB7IGFsaWFzOiB7IHV0aWw6ICd1dGlsLycsIHN0cmVhbTogJ3N0cmVhbS1icm93c2VyaWZ5JyB9IH0sXG4gIH0pO1xufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7OztBQUVBLFNBQVMsb0JBQWlEO0FBQzFELE9BQU8sV0FBVztBQUVsQixPQUFPLHVCQUF1QjtBQUM5QixPQUFPLGFBQWE7QUFDcEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxtQkFBbUI7QUFHMUIsSUFBTyxzQkFBUSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQW1DO0FBQ2pFLE1BQUksU0FBUyxVQUFVLFlBQVksU0FBUztBQUMxQyxXQUFPLGFBQWE7QUFBQTtBQUFBLE1B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
