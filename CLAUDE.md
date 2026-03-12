# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn setup               # Install dependencies (also copies flow-editor assets)
yarn dev                 # Start dev server at https://glific.test:3000
yarn test                # Run tests in watch mode
yarn test:no-watch       # Run tests once (CI mode)
yarn test:coverage       # Run tests with coverage
yarn build               # Production build
yarn format              # Format TS/CSS/GraphQL with Prettier
yarn extract-translations # Extract i18n strings for Lokalise
yarn serve               # Preview production build locally
```

**Run a single test file:**
```bash
npx vitest run src/path/to/Component.test.tsx
```

## Dev Environment Prerequisites

- Add `127.0.0.1 glific.test` to `/etc/hosts`
- Glific backend must be running — SSL certs are read from `../glific/priv/cert/`
- Node >= 20 <23; use yarn (not npm or bun)
- Copy `.env.example` to `.env` before first run
- All env vars exposed to the client must be prefixed with `VITE_`
- TypeScript type-checking runs live during `yarn dev` via `vite-plugin-checker` (no separate lint script)

## Architecture Overview

### Tech Stack
- **React 19** + **TypeScript** (strict mode), built with **Vite**
- **Apollo Client** for GraphQL — HTTP for queries/mutations, WebSocket for subscriptions
- **MUI v7** for UI components; custom theme at `src/config/theme.tsx`
- **React Router v7** for routing
- **Formik** + **Yup** for forms and validation
- **i18next** for internationalization
- **Vitest** + **Testing Library** for tests

### Directory Structure

| Path | Purpose |
|------|---------|
| `src/components/UI/` | Pure, reusable UI components (Button, Input, DialogBox, etc.) |
| `src/containers/` | Feature/page-level components with business logic |
| `src/graphql/queries/` | Apollo `gql` query definitions |
| `src/graphql/mutations/` | Apollo `gql` mutation definitions |
| `src/graphql/subscriptions/` | Apollo `gql` subscription definitions |
| `src/config/` | Apollo client setup, app constants/URLs, menu config, theme |
| `src/context/` | React contexts: `session.ts` (SideDrawer, Provider), `role.ts` (permissions) |
| `src/services/` | Service layer: Auth, Toast, Chat, Subscription, Tracking |
| `src/common/` | Shared utilities, constants, notification helpers |
| `src/mocks/` | Test mock data for Apollo `MockedProvider` |
| `src/routes/` | Route trees for authenticated and unauthenticated users |

### Import Aliases

`tsconfig.json` sets `baseUrl: "src"`, so all imports are relative to `src/`. Use:
```ts
import { Button } from 'components/UI/Form/Button/Button';
import { GET_FLOW } from 'graphql/queries/Flow';
```

SVG files are imported as React components using the `?react` suffix:
```ts
import FlowIcon from 'assets/images/icons/Flow/Selected.svg?react';
```

### Routing & Role-Based Access

`src/routes/AuthenticatedRoute/AuthenticatedRoute.tsx` defines two route trees:
- **`routeStaff`** — limited routes for Staff role
- **`routeAdmin`** — full routes for Manager/Admin/Glific_admin roles

Role determination happens in `src/context/role.ts`. Dynamic roles (custom org roles) are also supported via `checkDynamicRole()`.

The `UnauthenticatedRoute` handles login, OTP, registration, and password reset flows.

### Apollo Client (`src/config/apolloclient.ts`)

The Apollo client uses a split link:
- **Subscriptions** → `GraphQLWsLink` (WebSocket)
- **Queries/Mutations** → `RetryLink` → `TokenRefreshLink` → `errorLink` → `authLink` → HTTP

Authentication tokens are stored in `localStorage` under key `glific_session`. Token refresh is handled automatically; on failure, users are redirected to `/logout/session`.

Local Apollo cache is used for in-app notifications — do **not** use component state for toast messages.

### Notification / Toast Pattern

To show a success/error message anywhere in the app, write directly to the Apollo cache:
```ts
import { setNotification, setErrorMessage } from 'common/notification';

setNotification('Saved successfully');           // success toast
setNotification('Warning text', 'warning');
setErrorMessage(apolloError, 'Optional Title'); // error dialog
```

These functions write to `@client` Apollo fields (`NOTIFICATION`, `ERROR_MESSAGE`) which `ErrorHandler` and `ToastService` read reactively.

### Standard CRUD Patterns

**List pages** use `src/containers/List/List.tsx` — pass queries, column config, and action handlers as props.

**Form pages** use `src/containers/Form/FormLayout.tsx` — accepts `getItemQuery`, `createItemQuery`, `updateItemQuery`, `deleteItemQuery`, form field definitions, and a Yup `validationSchema`. See `src/containers/Flow/Flow.tsx` for a canonical example.

### Authentication (`src/services/AuthService.tsx`)

- `getAuthSession(key)` / `setAuthSession(data)` — read/write `localStorage.glific_session`
- `getUserSession(key)` — read `localStorage.glific_user`
- `getOrganizationServices(service)` — feature flags stored in `localStorage.organizationServices`
- `setAuthHeaders()` — monkey-patches `fetch` and `XMLHttpRequest` to inject auth token on all requests (called once at app start)

### Testing Conventions

Tests use `MockedProvider` from `@apollo/client/testing`. Mock data lives in `src/mocks/` organized by domain (e.g., `Chat.tsx`, `Flow.tsx`, `User.tsx`).

Keep reusable Apollo mock objects in domain-specific files under `src/mocks/` and import them into test files instead of redefining the same mocks inline. Prefer extracting shared mock factories/objects when multiple tests in a feature use the same GraphQL request or response shapes.

When a test file repeatedly renders the same provider-wrapped component (for example `MockedProvider` + component props), extract a local `renderXxx` helper that accepts optional `mocks` and `props` overrides. Use component prop types for the helper's `props` (e.g., `Partial<Parameters<typeof Component>[0]>`) so optional/nullable props remain correctly typed.

Global test setup (`src/setupTests.ts`) mocks: `react-i18next`, `react-media-recorder`, `TrackService`, and `config/logs`.

The `src/common/test-utils.ts` file contains helpers like `backspace()` for simulating keyboard events.
