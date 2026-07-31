#!/usr/bin/env node
/**
 * Spacing/typography migration helper.
 *
 * Unlike hardcoded colors (exact-match only), spacing and font-size values in this
 * codebase are inconsistent by accident, not by design — e.g. helper text drifts
 * between 12px/13px/14px/0.8rem across files when it was probably always meant to be
 * one size. So this script snaps each value to the NEAREST scale step (see the
 * `--app-space-*` / `--app-radius-*` / `--app-font-size-*` tokens in src/index.css)
 * rather than requiring an exact match.
 *
 * Tokens are defined in `rem` (see src/index.css for why — user font-size/zoom
 * accessibility). This script matches BOTH `px` and `rem` values in source files and
 * normalizes everything to a px-equivalent (assuming the 16px default root) purely for
 * the nearest-step distance math — the actual replacement is always `var(--app-...)`,
 * so the source file never ends up with a raw unit mismatch.
 *
 * Rules:
 *   - Only touches padding/margin/gap/border-radius/font-size declarations — the same
 *     property set the quality-ratchet script already tracks.
 *   - `border-radius` snaps against the radius scale; everything else against the
 *     matching space/font-size scale.
 *   - `0`/`0px`/`0rem` is left alone (absence of spacing isn't a scale step).
 *   - Non-length values (%, keywords like `auto`/`inherit`) are left alone.
 *   - Values ABOVE the top scale step are left alone and reported — there's no evidence
 *     what a reasonable token for them would be, so this script won't guess.
 *   - A value only snaps if the nearest step is within 2px-equivalent of it — otherwise
 *     it's left alone and reported. Without this cap, a sparse scale (only real call
 *     sites are declared — see src/index.css) would force distant values onto whatever
 *     happens to be nearest, which is a real visual change dressed up as a refactor.
 *   - Exact ties between two steps round UP (e.g. 10px is equidistant between 8 and 12
 *     -> snaps to 12).
 *   - `!important` is preserved.
 *
 * This is directional, not exact — always review a batch's diff before committing, the
 * same as the color migration.
 *
 * Usage:
 *   node scripts/migrate-spacing-typography.js <dir-or-file>            # dry run (report only)
 *   node scripts/migrate-spacing-typography.js <dir-or-file> --write    # apply in place
 *
 * The argument is a directory (searched recursively for module CSS files) or a single
 * file path — not a shell glob pattern. Rely on your shell to expand a glob before it
 * reaches this script (e.g. loop over the expanded file list yourself), since Node
 * doesn't expand globs on its own the way a shell does.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const INDEX_CSS_PATH = path.join(REPO_ROOT, 'src', 'index.css');

const REM_TO_PX = 16; // assumes the default root font-size — see src/index.css's note

function toPxEquivalent(num, unit) {
  return unit === 'rem' ? num * REM_TO_PX : num;
}

function parseScale(css, prefix) {
  const re = new RegExp(`--app-${prefix}-([a-z0-9]+):\\s*(\\d*\\.?\\d+)(px|rem)\\s*;`, 'g');
  const steps = [];
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(css))) {
    steps.push({ name: m[1], value: toPxEquivalent(parseFloat(m[2]), m[3]) });
  }
  steps.sort((a, b) => a.value - b.value);
  return steps;
}

// Max px distance a value may snap across. This matters most when the scale is sparse
// (only steps with a real call site are declared — see src/index.css) — without a cap,
// a value sitting in a gap between two declared steps would silently snap to whichever
// is "nearest" even if that's several px away, which is a real visual change dressed up
// as a refactor, not a safe tokenization. When this rejects a value, that's a signal the
// scale is missing a step, not that the value doesn't matter.
const MAX_SNAP_DISTANCE_PX = 2;

function nearestStep(value, steps) {
  if (steps.length === 0) return null;
  const max = steps[steps.length - 1].value;
  if (value > max) return null; // don't guess above the top of the scale

  let best = steps[0];
  let bestDist = Math.abs(value - best.value);
  for (const step of steps) {
    const dist = Math.abs(value - step.value);
    if (dist < bestDist || (dist === bestDist && step.value > best.value)) {
      // strictly closer wins; on an exact tie prefer the larger step (round up)
      best = step;
      bestDist = dist;
    }
  }
  if (bestDist > MAX_SNAP_DISTANCE_PX) return null;
  return best;
}

// primitive step name -> semantic alias name, only when exactly one semantic points to
// it (ambiguous otherwise) — mirrors migrate-hardcoded-colors.js's semantic preference.
function parseAliases(css, prefix) {
  const re = new RegExp(`--app-${prefix}-([a-z0-9]+):\\s*var\\(--app-${prefix}-([a-z0-9]+)\\)\\s*;`, 'g');
  const aliasesByPrimitive = new Map();
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(css))) {
    const [, semanticName, primitiveName] = m;
    if (!aliasesByPrimitive.has(primitiveName)) aliasesByPrimitive.set(primitiveName, []);
    aliasesByPrimitive.get(primitiveName).push(semanticName);
  }
  const preferredNameByPrimitive = new Map();
  for (const [primitiveName, aliases] of aliasesByPrimitive) {
    if (aliases.length === 1) preferredNameByPrimitive.set(primitiveName, aliases[0]);
  }
  return preferredNameByPrimitive;
}

function buildScales() {
  const css = readFileSync(INDEX_CSS_PATH, 'utf8');
  return {
    space: { steps: parseScale(css, 'space'), preferredNames: parseAliases(css, 'space') },
    radius: { steps: parseScale(css, 'radius'), preferredNames: parseAliases(css, 'radius') },
    fontSize: { steps: parseScale(css, 'font-size'), preferredNames: parseAliases(css, 'font-size') },
  };
}

// property name (without a -top/-left/etc. suffix) -> which scale it snaps against
function scaleFor(property, scales) {
  if (property === 'border-radius') return { ...scales.radius, prefix: 'radius' };
  if (property === 'font-size') return { ...scales.fontSize, prefix: 'font-size' };
  return { ...scales.space, prefix: 'space' };
}

const DECLARATION_RE =
  /(padding|margin|gap|border-radius|font-size)((?:-(?:top|bottom|left|right|inline|block))?)\s*:\s*([^;]+);/g;
const LENGTH_TOKEN_RE = /(-?(?:\d+(?:\.\d+)?|\.\d+))(px|rem)(\s*!important)?/g;

function migrateDeclaration(fullProperty, value, scales, unmatched) {
  const baseProperty = fullProperty.replace(/-(top|bottom|left|right|inline|block)$/, '');
  const { steps, preferredNames, prefix } = scaleFor(baseProperty, scales);
  let changed = false;

  const newValue = value.replace(LENGTH_TOKEN_RE, (whole, numStr, unit, important) => {
    const num = parseFloat(numStr);
    if (num === 0) return whole; // leave 0/0px/0rem alone
    const pxEquivalent = toPxEquivalent(Math.abs(num), unit);
    const step = nearestStep(pxEquivalent, steps);
    if (!step) {
      const key = `${baseProperty}: ${numStr}${unit}`;
      unmatched.set(key, (unmatched.get(key) || 0) + 1);
      return whole;
    }
    changed = true;
    const tokenName = preferredNames.get(step.name) || step.name;
    const token = `var(--app-${prefix}-${tokenName})`;
    // `-var(...)` is invalid CSS (parsed as an unknown function) — a negative value has
    // to negate the token inside calc() instead.
    return `${num < 0 ? `calc(-1 * ${token})` : token}${important || ''}`;
  });

  return { newValue, changed };
}

function walk(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) walk(fullPath, results);
    else if (fullPath.endsWith('.module.css')) results.push(fullPath);
  }
  return results;
}

function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--write');
  const shouldWrite = process.argv.includes('--write');
  const target = args[0];
  if (!target) {
    console.error('Usage: node scripts/migrate-spacing-typography.js <dir-or-file> [--write]');
    process.exit(1);
  }

  const targetPath = path.resolve(REPO_ROOT, target);
  const scales = buildScales();
  const files = statSync(targetPath).isDirectory() ? walk(targetPath) : [targetPath];

  let filesChanged = 0;
  let replacementsMade = 0;
  const unmatched = new Map();

  for (const file of files) {
    const original = readFileSync(file, 'utf8');
    let fileReplacements = 0;

    const updated = original.replace(DECLARATION_RE, (whole, property, suffix, value) => {
      const fullProperty = `${property}${suffix}`;
      const { newValue, changed } = migrateDeclaration(fullProperty, value, scales, unmatched);
      if (!changed) return whole;
      fileReplacements += 1;
      return whole.replace(value, newValue);
    });

    if (fileReplacements > 0) {
      filesChanged += 1;
      replacementsMade += fileReplacements;
      const relPath = path.relative(REPO_ROOT, file);
      console.log(`${shouldWrite ? 'Updated' : 'Would update'} ${relPath} (${fileReplacements} declaration(s))`);
      if (shouldWrite) writeFileSync(file, updated);
    }
  }

  console.log(
    `\n${filesChanged} file(s), ${replacementsMade} declaration(s) ${shouldWrite ? 'updated' : 'available'}.`
  );

  if (unmatched.size > 0) {
    console.log('\nValues above the top of the scale, or otherwise unmatched (left untouched):');
    const sorted = [...unmatched.entries()].sort((a, b) => b[1] - a[1]);
    for (const [key, count] of sorted) console.log(`  ${key}  (${count}x)`);
  }

  if (!shouldWrite && filesChanged > 0) {
    console.log('\nDry run only — re-run with --write to apply. Review the diff before committing.');
  }
}

main();
