#!/usr/bin/env node
/**
 * Design-system ratchet.
 *
 * Counts known design-system violations and compares them against a committed
 * baseline. CI fails only if a count goes UP — this lets a large existing backlog
 * be tracked without requiring it all fixed before any guardrail can be turned on.
 *
 * Usage:
 *   node scripts/design-system-ratchet.js          # check against baseline (CI)
 *   node scripts/design-system-ratchet.js --update  # rewrite the baseline to current counts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(REPO_ROOT, 'src');
const CONTAINERS_DIR = path.join(SRC_DIR, 'containers');
const BASELINE_PATH = path.join(__dirname, 'design-system-baseline.json');

const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/g;
// Spacing/typography properties where a raw px value should be a design token instead.
// Captures the full declaration value so every px in a shorthand (e.g. `padding: 4px 8px`)
// gets counted, not just the first one.
const SPACING_DECLARATION_RE = /(?:^|[{;])\s*(?:padding|margin|gap|border-radius|font-size)(?:-\w+)?\s*:\s*([^;}]*)/gm;
const PX_VALUE_RE = /\b\d*\.?\d+px\b/g;
// Matches both `import ... from '@mui/material'` and side-effect `import '@mui/material'`.
const MUI_IMPORT_RE = /(?:from\s+|import\s*)['"]@mui\/material(?:\/|['"])/;

function walk(dir, predicate, results = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, predicate, results);
    } else if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

function countRawMuiContainerFiles() {
  const files = walk(CONTAINERS_DIR, (p) => p.endsWith('.tsx') && !p.endsWith('.test.tsx'));
  return files.filter((file) => {
    const content = readFileSync(file, 'utf8');
    return MUI_IMPORT_RE.test(content);
  }).length;
}

function countModuleCssViolations() {
  const files = walk(SRC_DIR, (p) => p.endsWith('.module.css'));
  let hexOccurrences = 0;
  let rawSpacingOccurrences = 0;
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    hexOccurrences += (content.match(HEX_COLOR_RE) || []).length;
    for (const declaration of content.matchAll(SPACING_DECLARATION_RE)) {
      rawSpacingOccurrences += (declaration[1].match(PX_VALUE_RE) || []).length;
    }
  }
  return { hexOccurrences, rawSpacingOccurrences };
}

function computeCounts() {
  const { hexOccurrences, rawSpacingOccurrences } = countModuleCssViolations();
  return {
    rawMuiContainerFiles: countRawMuiContainerFiles(),
    hardcodedHexOccurrences: hexOccurrences,
    hardcodedSpacingOccurrences: rawSpacingOccurrences,
  };
}

function loadBaseline() {
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
}

// A hand-edited or corrupted baseline.json missing a key (or holding a non-numeric value)
// would make `current[key] > baseline[key]` silently false (anything > undefined is
// false in JS) — a real regression would pass unnoticed. Validate against `current`'s own
// keys, since computeCounts() always returns the full, authoritative set.
function assertValidBaseline(baseline, current) {
  const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
  const invalid = Object.keys(current).filter((key) => !isFiniteNumber(baseline[key]));
  if (invalid.length > 0) {
    console.error('scripts/design-system-baseline.json is missing or has an invalid value for:\n');
    for (const key of invalid) console.error(`  - ${key}`);
    console.error('\nEvery tracked metric must be present as a finite number.');
    process.exit(1);
  }
}

function main() {
  const shouldUpdate = process.argv.includes('--update');
  const current = computeCounts();
  const baseline = loadBaseline().counts;
  assertValidBaseline(baseline, current);

  if (shouldUpdate) {
    const increased = Object.keys(current).filter((key) => current[key] > baseline[key]);
    if (increased.length > 0) {
      console.error('Refusing to update — these counts would INCREASE the committed baseline:\n');
      for (const key of increased) console.error(`  - ${key}: ${baseline[key]} -> ${current[key]}`);
      console.error(
        '\n--update only lowers the baseline (fixing violations), it never raises it. ' +
          'If you genuinely added new, unavoidable violations, that needs a human decision, not a silent bump.'
      );
      process.exit(1);
    }
    writeFileSync(
      BASELINE_PATH,
      `${JSON.stringify({ description: loadBaselineDescription(), counts: current }, null, 2)}\n`
    );
    console.log('Baseline updated:');
    console.table(current);
    return;
  }

  const regressions = [];

  for (const key of Object.keys(current)) {
    if (current[key] > baseline[key]) {
      regressions.push(`  - ${key}: ${baseline[key]} -> ${current[key]} (+${current[key] - baseline[key]})`);
    }
  }

  console.log('Design-system violation counts:');
  console.table(
    Object.fromEntries(Object.keys(current).map((key) => [key, { baseline: baseline[key], current: current[key] }]))
  );

  if (regressions.length > 0) {
    console.error('\nDesign-system ratchet failed — these counts increased:\n');
    console.error(regressions.join('\n'));
    console.error(
      "\nDon't add new raw @mui/material imports in src/containers/** or new hardcoded " +
        'hex/px values in *.module.css. See src/components/UI/README.md for the shared ' +
        'components/tokens to use instead. If this PR genuinely reduces the count, run ' +
        '`node scripts/design-system-ratchet.js --update` and commit the updated baseline.'
    );
    process.exit(1);
  }

  const improved = Object.keys(current).filter((key) => current[key] < baseline[key]);
  if (improved.length > 0) {
    console.log(`\nNice — ${improved.join(', ')} decreased. Run with --update to lower the committed baseline.`);
  } else {
    console.log('\nNo regressions.');
  }
}

function loadBaselineDescription() {
  return 'Design-system violation baseline. Counts must only go down over time — see scripts/design-system-ratchet.js.';
}

main();
