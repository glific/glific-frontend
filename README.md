# Glific - Two Way Open Source Communication Platform

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![codecov](https://codecov.io/gh/glific/glific-frontend/graph/badge.svg?token=5OT73SIVT4)](https://codecov.io/gh/glific/glific-frontend)
![GitHub issues](https://img.shields.io/github/issues-raw/glific/glific-frontend)
[![Discord](https://img.shields.io/discord/717975833226248303.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/MVf2KF)
[![Cypress](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/ocex65/master&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/ocex65/runs)

Glific is a two-way communication platform built for nonprofits. This is the frontend interface built using React.

---

## 📋 Table of Contents
- [Pre-requisite](#pre-requisite)
  - [Software Dependencies](#software-dependencies)
    - [npm (via asdf)](#npm-via-asdf)
    - [yarn (via npm)](#yarn-via-npm)
  - [Glific Backend](#glific-backend)
- [Clone Frontend Repo](#clone-frontend-repo)
  - [Git commands to clone](#git-commands-to-clone)
- [Installation](#installation)
  - [Start backend server](#start-backend-server)
  - [Start frontend server](#start-frontend-server)
  - [Login credentials](#login-credentials)
  - [Configure Gupshup settings](#configure-gupshup-settings-optional)
- [Available Scripts](#available-scripts)
- [End-to-End (Cypress) Testing](#end-to-end-cypress-testing)
- [Docker Image for Production](#docker-image-for-production)
- [Localization](#localization)
- [Deploying Release on ECS with CD](#deploying-release-on-ecs-with-cd)
- [Learn More](#learn-more)

---

## Pre-requisite

### Software Dependencies

#### npm (via asdf)

```bash
asdf plugin-add nodejs
asdf install
```

#### yarn (via npm)

```bash
npm install --global yarn
```

## Clone Frontend Repo

### Git commands to clone

```bash
git clone git@github.com:glific/glific-frontend.git
```

---

### Glific Backend

You need to set up the backend service for Glific. Follow the instructions here:  
🔗 https://github.com/glific/glific

> 💡 Note: SSL is required in development for both frontend and backend. Follow the SSL setup instructions in the backend README.

Also, add the following entry to your `/etc/hosts` file:

```
127.0.0.1 glific.test
```

---

## Installation

1. Copy `.env.example` to `.env` in the project root:

   ```bash
   cp .env.example .env
   ```

2. **Do not modify `.env`** unless absolutely required.
3. Install dependencies:

   ```bash
   yarn setup
   ```

---

### Start backend server

Ensure your Glific backend server is running and accessible.

---

### Start frontend server

```bash
yarn dev
```

Visit `https://glific.test:3000` to open the app.

---

### Login credentials

* Phone: 917834811114

* Password: Secret1234!

---

### Configure Gupshup settings (Optional)

After logging in:


This step is required only if you're using Gupshup integration and have ISV credentials stored in the database.

1. Go to **Settings → Integration**.
2. Enter your Gupshup credentials and App Name.
3. Save the settings to auto-fetch your Gupshup App ID.

> 💡 Note: Auto-fetching the App ID will only work if valid ISV credentials are already present in the backend database.

---

## Available Scripts

```bash
yarn setup               # Install dependencies
yarn dev                 # Run app in development mode
yarn test                # Run tests in watch mode
yarn test:coverage       # Run tests with coverage
yarn build               # Create optimized production build
yarn extract-translations # Extract English strings for Lokalise
```

---

## End-to-End (Cypress) Testing

> 💡 The Cypress E2E suite used to live in a separate `glific-cypress` repo. It has since
> been **merged into this frontend repo** — all specs, fixtures, and support files now
> live under [`cypress/`](./cypress). If you're looking for the old repo, stop — make any
> new or updated E2E test changes here instead.

### Pre-requisites

- The **Glific backend** ([`glific/glific`](https://github.com/glific/glific)) must be
  running and reachable at `https://glific.test:4001`.
- The **frontend dev server** (this repo, `yarn dev`) must be running at
  `https://glific.test:3000`.
- Copy `cypress.config.ts.example` to `cypress.config.ts` (gitignored) and fill in your
  local/test credentials before running Cypress locally:

  ```bash
  cp cypress.config.ts.example cypress.config.ts
  ```

### Running the tests

```bash
yarn cy:open           # interactive Cypress runner
yarn cy:run            # headless run
```

### Linting & formatting

Cypress specs are linted/formatted independently of the main app, scoped to `cypress/`:

```bash
yarn cy:typecheck      # tsc against cypress/tsconfig.json
yarn cy:lint           # ESLint scoped to cypress/
yarn cy:format         # Prettier write scoped to cypress/
yarn cy:format:check   # Prettier check scoped to cypress/
```

### CI

- `e2e-tests.yml` runs the full suite (sharded via `cypress-split`) against a live backend
  on every PR. The slow `filesearch` suite is excluded by default and only runs on PRs
  labeled `e2e-slow` (`e2e-tests-slow.yml`).
- `cypress-lint.yml` runs `tsc`/ESLint/Prettier scoped to `cypress/` on every push and PR.
- `cypress-smoke.yml` is a cron job that runs `cypress/e2e/smoke.spec.ts` against
  production and reports pass/fail to Instatus.

### Adding or updating specs

Whenever you add a new page, form, dialog, or flow to the app, add or extend a spec under
`cypress/e2e/` in **this** repo, following the existing folder/fixture conventions. If
you're fixing behavior an existing spec covers, update that spec here too — there is no
longer a separate Cypress repo to keep in sync.

---

## Docker Image for Production

To build a production Docker image:

```bash
docker build \
--build-arg VITE_GLIFIC_API_PORT=API-PORT \
--no-cache -t glific-frontend .
```

Replace `API-PORT` with your backend API port number.

---

## Localization

1. Extract base strings:

   ```bash
   yarn extract-translations
   ```

2. Once merged into `main`, strings will appear in [Lokalise](https://lokalise.com).
3. Use `Download → Build only` in Lokalise to push translations.
4. This will create a PR automatically in the frontend repo.
5. It's recommended to **Preview** before building.

---

## Deploying Release on ECS with CD

- For AWS CodeBuild, use `buildspec.yml.sample` as your config file.
- For Docker Hub and alternatives, use this GitHub Action:  
  🔗 https://github.com/marketplace/actions/build-and-push-docker-images

---

## Learn More

- 🌐 [Glific.org](https://glific.org/)
- 📄 [One Pager](https://docs.google.com/document/d/1XYxNvIYzNyX2Ve99-HrmTC8utyBFaf_Y7NP1dFYxI9Q/edit?usp=sharing)
- 📁 [Google Drive](https://glific.github.io/docs/docs/intro)
- 📝 [Product Features](https://glific.github.io/docs/docs/category/product-features)
- 📰 [Blogs](https://glific.org/blogs/)
### Chat With Us  
- 💬 [Discord](https://discord.gg/scsrGUw)
