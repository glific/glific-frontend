---
name: improve-code-coverage
description: Make the current branch satisfy the Glific frontend Codecov gates (project + patch) by finding uncovered changed lines with Vitest/istanbul coverage and adding focused, behavior-asserting tests until green. Use when the user asks to improve coverage, fix a codecov/patch or codecov/project failure, or satisfy codecov.yml on the current branch.
disable-model-invocation: true
---

# Improve Code Coverage (Frontend)

Iterative loop: generate Vitest coverage, find uncovered **changed** lines, add tests that assert real behavior, repeat until the gate is green. No `git push` or Codecov upload required to iterate.

## Gates (`codecov.yml`)

| Check | Rule |
|-------|------|
| **project** | target **81.5%**, threshold **0.5%** |
| **patch** | threshold **0%** — **every changed line in the diff must be covered** |

The **patch** gate is strict: a single uncovered new/changed line fails `codecov/patch`. Most failures are an un-exercised callback (e.g. an `onApply`/`onClose`/`onError` handler) or an error branch.

## Tools

- `yarn test:coverage` — full suite coverage (istanbul). Slow; use for the final check.
- Scoped coverage for a single file (fast iteration):
  ```bash
  CI=true npx vitest run src/path/to/File.test.tsx \
    --coverage --coverage.include='src/path/to/File.tsx'
  ```
  The report’s **`Uncovered Line #s`** column is your worklist.
- Map uncovered lines to *your* diff (only changed lines count for patch):
  ```bash
  git diff -U0 origin/master -- src/path/to/File.tsx | grep '^@@'
  ```
  Lines outside your `@@` hunks are pre-existing — ignore them for `codecov/patch`.

## Loop (repeat until green)

1. Run scoped coverage on the changed file(s); note `Uncovered Line #s`.
2. Cross-check against your diff hunks — keep only uncovered lines **you added/changed**.
3. Add/extend a test that **exercises and asserts** that line’s behavior:
   - Prefer existing mocks in `src/mocks/` and `MockedProvider`.
   - To cover a callback handler without driving a heavy child’s real async, **mock the child** so it calls the handler directly (see **fix-flaky-tests** §6). This avoids real timers and keeps the test fast and deterministic.
   - Cover error branches with the matching error mock (e.g. `…ErrorMocks`).
4. Re-run scoped coverage; repeat until no changed lines are uncovered.
5. Final: `npx tsc --noEmit` (0 errors) and `npx prettier --check <changed test files>`.

## Hard rules

- **Never** weaken `codecov.yml`, exclude files, or lower thresholds to go green.
- **Never** add tests that only execute lines without asserting behavior.
- If `codecov/patch` is failing on lines **outside your PR’s scope**, stop and ask the user — don’t backfill unrelated coverage.
- Don’t commit unless the user asked; iterate on the working tree.

## When to ask the user

- 5 loops without green.
- Patch gaps require large unrelated test work.
- A changed line is genuinely untestable (e.g. defensive `default` branch) — propose excluding *just that line* with an `istanbul ignore` comment and ask before adding it.

## Related skills

- **fix-flaky-tests** — if a test fails intermittently during a coverage run, or you need fake-timers/child-mocking to cover async handlers.
- **make-branch-ready-for-review** — push + poll CI/Codecov after the local gate is green.
