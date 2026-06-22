---
name: code-review
description: Review the current branch / PR diff for the glific-frontend codebase against its React 19 + TypeScript + Apollo conventions. Use before opening or merging a PR, or when asked to review frontend changes.
---

# Frontend code review (glific-frontend)

Review the changes on the current branch (default: diff against `master`) and report
findings grouped by severity. Be concrete: cite `file:line`, explain the impact, and give a
fix. Skip praise; focus on what should change.

## How to run

1. Get the diff: `git diff master...HEAD` (or the PR's base). If a PR number is given, use
   `gh pr diff <n>`.
2. Read the changed files in full where needed — don't review from the diff hunk alone.
3. Verify each finding against the current code before reporting it; drop anything that
   doesn't still hold.

## What to check (this codebase's conventions)

**Component reuse — don't reinvent.** Before flagging new UI, check `src/components/UI/`
(`Button`, `Input`, `DialogBox`, `AutoComplete`, `Dropdown`, etc.). New components that
duplicate an existing one are a finding. Likewise duplicated CSS classes/styles.

**Apollo / data layer.**
- **No `onCompleted` / `onError`** (deprecated here). Mutations must `await` + `try/catch`;
  queries derive state from `data`/`error` via `useEffect`. Flag any new usage.
- Toasts/notifications go through the Apollo cache helpers (`setNotification` /
  `setErrorMessage`), **not** component state.
- By-id reads/writes and cache updates should be correct and not over-fetch.

**TypeScript.** No new `any` where a real type is feasible; props typed; no unused exports.

**i18n.** Every user-facing string uses `t('...')` and the key exists in `src/i18n/en/en.json`
(typed keys — a missing key fails `tsc`). Add to `hi/hi.json` too. American spelling
("Organization", not "Organisation") for consistency.

**Multi-tenant / auth.** Org/user context comes from the session, never trusted from client
input. Don't leak one entity's data into another (e.g. state that should reset per route).

**Tests.** New logic/branches need tests (`*.test.tsx` with `MockedProvider`); reuse shared
mocks from `src/mocks/` instead of redefining inline. Check codecov/patch won't drop — every
new branch (success, failure, empty, error) should be exercised.

**Accessibility & UX.** Interactive elements have `data-testid` where tested; loading/empty/
error states handled; nothing silently disabled without explanation.

**Scope.** Changes match the PR's stated purpose — unrelated edits belong in a separate PR.

## Output format

```
## Review: <branch/PR>

### Blocking
- `path:line` — <issue> → <fix>

### Should fix
- ...

### Nits
- ...

### Looks good
- <brief notes on what's solid>
```

If nothing is blocking, say so explicitly.
