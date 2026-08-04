#!/usr/bin/env node
/**
 * Fails if a PR's diff ADDS a new raw @mui/material import in src/containers/**.
 *
 * Deliberately does NOT run a linter against the full content of touched files — that
 * flags a file's pre-existing import just because the PR happened to touch an unrelated
 * line elsewhere in it (this is exactly what broke: a PR fixing an unrelated line in
 * HSMV2.tsx got blocked by that file's existing MUI import from before, which the PR
 * never touched). Only lines the diff actually adds (`+`) count.
 *
 * Also deliberately has ZERO dependencies beyond Node builtins and `git` — no ESLint, no
 * ESLint config format, nothing that some unrelated PR's dependency bump can silently
 * break out from under this check again. Matches design-system-ratchet.js's own
 * MUI_IMPORT_RE exactly, so the two mechanisms can't disagree with each other.
 *
 * Usage: node scripts/check-new-mui-imports.js <base-ref> [<head-ref>]
 */
import { execFileSync } from 'node:child_process';

const MUI_IMPORT_RE = /^\+.*(?:from\s+|import\s*)['"]@mui\/material(?:\/|['"])/;
const CONTAINERS_TSX_RE = /^src\/containers\/.*\.tsx?$/;
const TEST_FILE_RE = /\.test\.tsx?$/;

function main() {
  const [baseRef, headRef = 'HEAD'] = process.argv.slice(2);
  if (!baseRef) {
    console.error('Usage: node scripts/check-new-mui-imports.js <base-ref> [<head-ref>]');
    process.exit(1);
  }

  const diff = execFileSync('git', ['diff', '--diff-filter=ACMR', '-U0', baseRef, headRef, '--', 'src/containers'], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 100,
  });

  const violations = [];
  let currentFile = null;
  let inScope = false;
  let newLineNumber = 0;

  for (const line of diff.split('\n')) {
    const fileMatch = line.match(/^\+\+\+ b\/(.*)$/);
    if (fileMatch) {
      currentFile = fileMatch[1];
      inScope = CONTAINERS_TSX_RE.test(currentFile) && !TEST_FILE_RE.test(currentFile);
      continue;
    }

    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (hunkMatch) {
      newLineNumber = parseInt(hunkMatch[1], 10);
      continue;
    }

    if (!inScope || !line.startsWith('+') || line.startsWith('+++')) continue;

    if (MUI_IMPORT_RE.test(line)) {
      violations.push(`${currentFile}:${newLineNumber} — ${line.slice(1).trim()}`);
    }
    newLineNumber += 1;
  }

  if (violations.length > 0) {
    console.error('New raw @mui/material import(s) added in src/containers/**:\n');
    for (const v of violations) console.error(`  - ${v}`);
    console.error('\nUse a shared component from src/components/UI instead (see src/components/UI/README.md).');
    process.exit(1);
  }

  console.log('No new raw MUI imports introduced.');
}

main();
