---
name: make-branch-ready-for-review
description: Take the current Glific frontend branch from local changes through green CI and addressed bot/reviewer comments, ready for human review. Runs tsc + prettier + Vitest + coverage locally, fixes the PR title to the required format, pushes, then polls Unit Testing / Prettier / E2E / Codecov / CodeRabbit until green — handling the common gotchas (un-scheduled workflows, Cypress infra flakes). Use when the user asks to make a branch review-ready or get changes ready for review.
disable-model-invocation: true
---

# Make Branch Ready for Review (Frontend)

End-to-end workflow to get **the current branch** to green CI and addressed automated review.

## Prerequisites

- On the intended feature branch (not `master` unless the user says so).
- `gh` authenticated for `glific/glific-frontend`.
- Node/yarn installed (`yarn install --frozen-lockfile` if deps are stale).

## Hard rules

- **Never** edit CI workflow files or disable checks to make failures pass.
- **Never** force-push to `master`; force-push to a feature branch only with `--force-with-lease`.
- **Never** commit secrets (`.env`, tokens).
- During the post-push loop, fix locally and push once per iteration; **don’t** churn force-pushes for every tiny tweak — batch them, and for visual/CSS tweaks let the user confirm via HMR before pushing.
- Stop and ask the user on high-risk or out-of-scope fixes.

## Progress checklist

```
- [ ] Phase 1 — Local quality (tsc, prettier, Vitest, coverage)
- [ ] Phase 2 — PR title + self-review
- [ ] Phase 3 — Commit and push
- [ ] Phase 4 — CI loop (Unit Testing, Prettier, E2E, Codecov, CodeRabbit)
- [ ] Phase 5 — Address review comments; final green
```

## Phase 1 — Local quality

```bash
npx tsc --noEmit                                  # 0 type errors
npx prettier --check "src/**/*.{ts,tsx,css,graphql}"   # or: yarn format (writes)
CI=true yarn test:no-watch                        # full Vitest suite green
```
- Coverage: ensure the **patch** gate will pass (every changed line covered) — use **improve-code-coverage**.
- Flaky/intermittent failures → **fix-flaky-tests** (don’t retry-loop CI hoping it passes).

## Phase 2 — PR title (strict) + self-review

The **`Validate PR title format`** check requires `^(feat|fix|build|chore|ci|docs|style|refactor|perf|test)!?: ` — i.e. **`<type>: ` with NO scope**. `feat(prompt-generator): …` **fails**; use `feat: …`. Fix with:
```bash
gh pr edit <PR#> --title "feat: <summary>"
```
Self-review the diff for scope creep, leftover logs, and reuse opportunities (or run the **code-review** skill).

## Phase 3 — Commit and push

Commit in focused chunks; confirm with the user before pushing/opening a PR if they’ve asked to. Push, then open the PR with `gh pr create` (PR-triggered CI runs against the merge ref).

## Phase 4 — CI loop

Workflows that gate the PR: **Unit Testing** (job shows as the `CI` check), **Prettier** (`Check formatting`), **E2E Tests** (Cypress, sharded), **Build and Deploy to Netlify**, **Validate PR title format**, plus **codecov/patch**, **codecov/project**, and **CodeRabbit**.

Read the authoritative rollup:
```bash
gh pr view <PR#> --json statusCheckRollup \
  -q '.statusCheckRollup[] | "\(.status // .state)/\(.conclusion // "-")  \(.name // .context)"' | sort -u
```

Gotchas seen in practice:
- **Un-scheduled workflows:** after a push, sometimes only `PR Title Check` runs and `Unit Testing`/`Prettier`/`E2E` never get created (GitHub Actions scheduling miss). Confirm with:
  ```bash
  gh run list --workflow "Unit Testing" --limit 5 --json headSha,status,conclusion
  ```
  If there’s no run for your head SHA and nothing queued, **re-trigger** by close/reopen (no history rewrite):
  ```bash
  gh pr close <PR#> && gh pr reopen <PR#>
  ```
- **Cypress shard fails on infra** (`Verifying Cypress can run … timed out`, network/asset timeouts) while other shards pass → re-run just that shard: `gh run rerun <e2e-run-id> --failed`. Not a code failure.
- **CI stderr noise:** Apollo `addTypename` warnings are not failures — grep them out when reading logs.

Fix any real failures locally (commit), then push and re-poll.

## Phase 5 — Review comments

- Fetch CodeRabbit + human review comments:
  ```bash
  gh api repos/glific/glific-frontend/pulls/<PR#>/comments --paginate \
    -q '.[] | "@\(.user.login) \(.path):\(.line)\n\(.body)\n---"'
  gh pr view <PR#> --json reviews -q '.reviews[] | "@\(.user.login) [\(.state)]: \(.body)"'
  ```
- Apply valid suggestions (i18n via `t('English text')`, accessibility, reuse). For inherited/pre-existing nits, note why if skipping.
- For **visual/CSS** review comments, remember the shared `Button` base style applies a white fill + drop shadow + 27px pill radius to every button — override per-component (e.g. `box-shadow: none !important`, `border-radius`) rather than editing the shared component. Let the user confirm via HMR before pushing.
- Re-run **improve-code-coverage** / **fix-flaky-tests** if a fix touches tests.

## Definition of done

All gating checks green on the head SHA, CodeRabbit review completed, reviewer threads addressed, branch ready for human merge.

## Related skills

- **fix-flaky-tests**, **improve-code-coverage**, **code-review**.
