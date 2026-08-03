#!/usr/bin/env node
/**
 * Guards against a PR raising scripts/design-system-baseline.json directly (hand-editing
 * the committed numbers up, rather than the code actually improving) — closing the gap
 * design-system-ratchet.js's own --update guard can't: that guard only stops the script
 * itself from raising a count, it can't stop someone editing the JSON file by hand in the
 * same PR that also adds new violations, since both would move together and the ratchet
 * check would pass.
 *
 * Compares this PR's baseline against the base branch's committed version and fails if
 * any count is higher — the committed baseline may only ever go down.
 *
 * Usage:
 *   node scripts/verify-baseline-not-raised.js <base-ref>
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(__dirname, 'design-system-baseline.json');
const RELATIVE_BASELINE_PATH = 'scripts/design-system-baseline.json';

function main() {
  const baseRef = process.argv[2];
  if (!baseRef) {
    console.error('Usage: node scripts/verify-baseline-not-raised.js <base-ref>');
    process.exit(1);
  }

  let baseCounts;
  try {
    const baseContent = execFileSync('git', ['show', `${baseRef}:${RELATIVE_BASELINE_PATH}`], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    baseCounts = JSON.parse(baseContent).counts;
  } catch {
    // Base ref doesn't have this file yet (e.g. this PR introduces it) — nothing to compare.
    console.log('No baseline file on the base ref yet — nothing to verify.');
    return;
  }

  const prCounts = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).counts;

  // Check every metric the BASE tracks, not just whatever keys the PR happens to still
  // have — otherwise a PR could delete a metric entirely (rather than raising it) to
  // dodge this check, since a value that's just missing was never flagged as "increased".
  const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
  const missingOrInvalid = Object.keys(baseCounts).filter((key) => !isFiniteNumber(prCounts[key]));
  if (missingOrInvalid.length > 0) {
    console.error('scripts/design-system-baseline.json is missing or has an invalid value for:\n');
    for (const key of missingOrInvalid) console.error(`  - ${key}`);
    console.error('\nEvery metric the base branch tracks must still be present here as a finite number.');
    process.exit(1);
  }

  const increased = Object.keys(baseCounts).filter((key) => prCounts[key] > baseCounts[key]);
  if (increased.length > 0) {
    console.error('scripts/design-system-baseline.json was raised for:\n');
    for (const key of increased) {
      console.error(`  - ${key}: ${baseCounts[key]} -> ${prCounts[key]}`);
    }
    console.error(
      '\nThe committed baseline may only go down (fixing violations), never up — this is ' +
        "true regardless of what the code changes elsewhere in the PR do. If this wasn't " +
        'intentional, revert the baseline file change; if it was, that needs a human decision.'
    );
    process.exit(1);
  }

  console.log('Baseline file was not raised relative to the base branch.');
}

main();
