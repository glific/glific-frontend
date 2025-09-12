# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glific Frontend is a React-based two-way communication platform for nonprofits. It uses TypeScript, Material-UI, Apollo GraphQL, and Vite.

## Essential Commands

```bash
# Development
yarn dev                 # Start dev server at https://glific.test:3000 (requires SSL setup)
yarn build              # Production build

# Testing
yarn test               # Run tests in watch mode
yarn test:coverage      # Run tests with coverage report

# Code Quality
yarn format             # Format code with Prettier
yarn eslint:fix         # Fix ESLint issues

# Setup
yarn setup              # Install dependencies and setup flow editor
```

## Architecture Overview

### Core Technologies
- **React 19.1.0** with TypeScript
- **Apollo Client** for GraphQL API communication
- **Material-UI (MUI)** for UI components
- **Vite** as build tool
- **Vitest** for testing
- **React Router** for routing

### Project Structure

The codebase follows a container-component pattern with feature-based organization:

```
src/
├── containers/         # Feature containers (Chat, Flow, Auth, etc.)
├── components/         # Reusable UI components
├── graphql/           # GraphQL queries, mutations, subscriptions
├── services/          # Business logic and API services
├── common/            # Shared utilities and constants
├── config/            # Apollo, theme, menu configuration
├── routes/            # Route definitions (AuthenticatedRoute, UnauthenticatedRoute)
└── context/           # React context providers
```

### Key Architectural Patterns

1. **GraphQL-First**: All API communication through Apollo Client with queries/mutations/subscriptions organized in `src/graphql/`
2. **Container-Component Separation**: Smart containers in `src/containers/` handle logic, presentational components in `src/components/`
3. **Feature-Based Organization**: Major features (Chat, Flow, Collection, HSM) have dedicated container directories
4. **Context-Based State**: App-wide state managed through React Context (e.g., SideDrawerContext)

### Important Services

- **AuthService** (`src/services/AuthService.tsx`): Authentication and token management
- **ChatService** (`src/services/ChatService.ts`): Real-time chat functionality
- **FlowService**: Flow editor integration and management

### Testing Approach

- Tests use Vitest with React Testing Library
- Mock setup in `src/setupTests.ts`
- Test files colocated with components (`.test.tsx` files)
- Coverage reports generated with `yarn test:coverage`

## Development Requirements

1. **SSL Setup Required**: Development server requires SSL certificates for `glific.test` domain
2. **Backend Dependency**: Requires Glific backend running with GraphQL API
3. **Host Entry**: Add `127.0.0.1 glific.test` to `/etc/hosts`

## Key Configuration Files

- `vite.config.ts`: Vite configuration with SSL and proxy setup
- `tsconfig.json`: TypeScript configuration
- `.eslintrc.json`: ESLint rules (Airbnb + TypeScript)
- `vitest.config.ts`: Test configuration with coverage settings

## GraphQL Integration

- Queries/Mutations in `src/graphql/queries/` and `src/graphql/mutations/`
- Subscriptions for real-time updates in `src/graphql/subscriptions/`
- Apollo Client configured in `src/config/apolloclient.ts`

## Internationalization

- i18next for translations
- Translation files in `src/i18n/`
- Extract translations: `yarn extract-translations`

## Flow Editor

- Custom flow editor integration using `@glific/flow-editor` package
- Assets copied during setup with `yarn floweditor`
- Flow-related components in `src/containers/Flow/`