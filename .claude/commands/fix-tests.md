---
description: Diagnose and fix failing tests in glific-frontend
---

Diagnose and fix failing `glific-frontend` tests using this workflow:

1. Reproduce failures with `npx vitest run <failing-file>` when a file is known, otherwise `yarn test:no-watch`.
2. Capture the first failing assertion and stack trace, then identify the true root cause (not cascading failures).
3. Locate the component/hook/service under test and confirm intended behavior.
4. Fix in this order:
   - broken test setup or stale mock
   - timing/async race (`await`, `waitFor`, `findBy*`)
   - incorrect selector/text expectation
   - real product regression
5. Apply the smallest safe fix, preferring test fixes for setup/mocks and product code fixes only for real regressions.
6. Follow these conventions while fixing:
   - use `MockedProvider` and prefer existing domain mocks from `src/mocks/`
   - prefer extracted local render helpers in larger test files
   - use Testing Library queries intentionally: `getBy*` (immediate), `findBy*` (async), `queryBy*` (absence)
   - prefer behavior assertions over implementation details
   - keep `react-i18next` expectations aligned with current test mocks
7. Re-run the targeted test file and report pass/fail.
8. If shared behavior changed, run `yarn test:no-watch` and report remaining failures.
9. Summarize:
   - root cause
   - files changed
   - commands run
   - final test status
