#!/usr/bin/env node
/**
 * Fails if the diff between two git refs adds a new raw @mui/material import under
 * src/containers/**. Only lines the diff itself adds count, so a file's pre-existing
 * import isn't flagged just because the file was touched for an unrelated reason.
 *
 * No dependencies beyond Node builtins and git.
 *
 * Usage: node scripts/check-new-mui-imports.js [<base-ref>] [<head-ref>]
 */
import { execFileSync } from 'node:child_process';

const MUI_IMPORT_RE = /^\+.*(?:from\s+|import\s*)['"]@mui\/material(?:\/|['"])/;
const COMMENT_LINE_RE = /^\+\s*(\/\/|\/\*|\*)/;
const CONTAINERS_TSX_RE = /^src\/containers\/.*\.tsx?$/;
const TEST_FILE_RE = /\.test\.tsx?$/;

function main() {
  const [baseRef = 'origin/master', headRef = 'HEAD'] = process.argv.slice(2);

  let diff;
  try {
    diff = execFileSync(
      'git',
      ['diff', '--diff-filter=ACMR', '-U0', baseRef, headRef, '--', 'src/containers'],
      { encoding: 'utf8', maxBuffer: 1024 * 1024 * 100 }
    );
  } catch (error) {
    console.error(`Failed to diff ${baseRef}..${headRef}: ${error.message}`);
    process.exit(1);
  }

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

    if (MUI_IMPORT_RE.test(line) && !COMMENT_LINE_RE.test(line)) {
      violations.push(`${currentFile}:${newLineNumber} — ${line.slice(1).trim()}`);
    }
    newLineNumber += 1;
  }

  if (violations.length > 0) {
    console.error('New raw @mui/material import(s) added in src/containers/**:\n');
    for (const v of violations) console.error(`  - ${v}`);
    console.error(
      '\nUse a component from src/components/UI instead of importing directly from @mui/material. See src/components/UI/README.md.'
    );
    process.exit(1);
  }

  console.log('No new raw MUI imports introduced.');
}

main();
