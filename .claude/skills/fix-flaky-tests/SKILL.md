---
name: fix-flaky-tests
description: Diagnose and fix flaky/nondeterministic tests in the Glific frontend (Vitest + React Testing Library + Apollo MockedProvider, plus Cypress e2e). Reproduce intermittency, classify the root cause (real-timer/polling races, cross-file timer leakage, unflushed act() updates, global/localStorage state leakage, MockedProvider mock exhaustion, Cypress infra flakes), apply the smallest safe fix (usually fake timers or proper isolation), and verify with repeated isolated + one clean concurrent run. Use when the user reports flaky tests or shares CI logs for intermittent failures.
disable-model-invocation: true
effort: xhigh
---

# Fix Flaky Tests (Frontend)

Evidence-first workflow for flaky **Vitest** unit/component tests and **Cypress** e2e. Do not guess — reproduce, classify with evidence, fix minimally, verify.

## Required inputs

Do not begin until the user provides one:
1. A list of flaky tests (file path, optionally test name), or
2. CI logs showing the intermittent failure (the `Unit Testing` / `E2E Tests` workflow log).

If neither is given, ask for it. Then extract the **exact failing test name + file + error shape** from the log — CI stderr is full of Apollo `addTypename` warnings; grep them out (`grep -vE "An error occurred|apollo.dev"`) and look for the real `FAIL … > <test name>` / `Failed Tests` line.

## Reproduce locally (targeted)

Vitest:
```bash
yarn test:no-watch src/path/to/File.test.tsx                 # one file
yarn test:no-watch src/path/to/File.test.tsx -t "test name"  # one test
yarn test:no-watch src/containers/<area>                     # a directory (concurrent workers)
```

Two stress modes — **run them one at a time**:
- **Isolated**: loop the single file ~20–25×.
- **Concurrent**: loop the whole directory ~6× (parallel workers — this reproduces the CI event-loop-starvation condition that exposes timer races).

> ⚠️ **Never run two stress loops at once.** Saturating the CPU makes even healthy *synchronous* tests miss an `act()` flush and fail — a measurement artifact, not a real flake. One loop at a time, or you'll chase ghosts.

If it won't reproduce locally even concurrently, the flake is almost always **real-timer/polling** (see below) — fix it structurally; you don't need a local repro to justify fake timers.

## Classify the root cause (with evidence)

1. **Real-timer / polling races (most common here)**
   - Symptoms: passes in isolation, fails under CI parallel load; component uses Apollo `startPolling`/`stopPolling`, `setInterval`, or `setTimeout`; the test uses `waitFor` with a timeout to reach a polled state.
   - Why: under load the event loop is starved, so wall-clock timers race `waitFor`’s own polling, and timers can leak across files sharing a worker.
   - **Fix — fake timers (deterministic):**
     ```ts
     beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); });
     afterEach(() => { vi.runOnlyPendingTimers(); vi.useRealTimers(); });

     const advance = async (ms: number) => {
       await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
     };
     ```
     Drive the flow by advancing the clock (`await advance(POLL_INTERVAL * 3)`) instead of `waitFor`. `advanceTimersByTimeAsync` also flushes the microtasks that resolve `MockedProvider` results. Assert synchronously after advancing. Phase changes that happen synchronously on click (e.g. `setPhase('generating')`) can be asserted before advancing.

2. **Cross-file timer / state leakage**
   - Symptoms: a *sync* test fails only when run with the rest of its directory.
   - Fixes: fake timers (above) make leaked timers inert; `vi.clearAllMocks()` + `localStorage.removeItem(...)` in `beforeEach`; ensure the component clears its timers/polling on unmount.

3. **Unflushed `act()` state updates**
   - Symptoms: `An update to X inside a test was not wrapped in act(...)`, or an assertion races a state update.
   - Fix: wrap the triggering interaction/timer-advance in `act`, or `await` a `findBy*`/`waitFor` for the resulting DOM.

4. **Global / `localStorage` leakage**
   - Glific reads feature flags from `localStorage['organizationServices']` (set at login). Tests that set it must clear it in `beforeEach`/`afterEach` or it leaks into later tests.

5. **MockedProvider issues**
   - Mock exhaustion (a poll ticks more times than there are mocks → "No more mocked responses") — add buffer mocks or stop polling deterministically.
   - Order-dependent mock consumption — keep mocks per-render, not shared mutable across files.

6. **Heavy child component doing real async** (alternative to fake timers)
   - If you only need to cover a *parent’s* callback (e.g. `onApply`), **mock the child** so it invokes the callback directly — no real timers at all:
     ```ts
     vi.mock('../Child/Modal', () => ({
       initialFoo: {},
       Modal: ({ open, onApply, onClose }: any) =>
         open ? <button data-testid="apply" onClick={() => onApply('x')}>apply</button> : null,
     }));
     ```

7. **Cypress e2e**
   - `Verifying Cypress can run … FAILED: Cypress verification timed out`, network/asset timeouts, or a single shard failing while others pass = **CI infrastructure flake**, not a code bug. Re-run the failed shard: `gh run rerun <e2e-run-id> --failed`. Only treat as a real flake if it reproduces across re-runs.

## Apply the smallest safe fix

- Prefer test/setup fixes when the product behavior is correct (it usually is for timing flakes).
- Change app code only with proven behavioral regression.
- Keep the same assertions; change only *how* the test reaches the state.

## Hard guardrail

If you cannot demonstrate the root cause with evidence **and** the structural fix (fake timers / isolation) doesn’t apply, say so plainly — do not weaken assertions, add arbitrary `waitFor` timeouts, or `skip`/`retry` the test to hide it.

## Verify (mandatory)

- Run the fixed file **isolated ~20×** → 0 failures.
- Run its **directory once concurrently** (clean, nothing else running) → pass.
- `npx tsc --noEmit` → 0 errors; `npx prettier --check <changed files>` → clean.
- For Cypress: confirm a clean re-run of the shard.

Report: root cause + why it was flaky, files changed, the stress matrix (isolated N/N, concurrent pass), and tsc/prettier status.

## Glific FE conventions to respect

- Vitest + React Testing Library; Apollo `MockedProvider` for GraphQL; `act` from `@testing-library/react`.
- Use existing mocks under `src/mocks/`; don’t hand-roll GraphQL responses when a mock exists.
- Keep `data-testid`s stable (tests and the codebase key on them).
- The Apollo `addTypename` stderr noise is pre-existing — never treat it as the failure.

## Related skills

- **improve-code-coverage** — when `codecov/patch` fails after a fix.
- **make-branch-ready-for-review** — full green-CI workflow (includes re-triggering stuck runs and re-running Cypress infra flakes).
