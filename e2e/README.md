# E2E tests (Playwright)

End-to-end tests that drive the real built UI in a headless browser.

These specs are **self-contained**: they seed a fake-but-valid session + the
relevant service flags into `localStorage` (auth is decided client-side from
`token_expiry_time`) and mock the GraphQL/REST network at the Playwright layer,
so they run **offline** — no backend or Kaapi required. Only the SPA dev server
needs to be running.

## Run

```bash
# 1. start the dev server (serves the SPA; backend not required)
yarn dev

# 2. in another terminal, run the e2e suite
yarn test:e2e            # headless
yarn test:e2e:ui         # interactive UI mode
```

If the dev server isn't on the default `https://glific.test:3000`, point the
tests at it:

```bash
PLAYWRIGHT_BASE_URL=https://glific.test:3001 yarn test:e2e
```

## Notes

- First-time setup also needs the browser binary: `npx playwright install chromium`.
- To test against a **real** backend/Kaapi instead of mocks, remove the
  `page.route(...)` network mocks in the spec and provide a real authenticated
  `storageState` (log in once and save it) instead of the seeded session.
