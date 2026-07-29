#!/usr/bin/env node
/**
 * Hardcoded-color migration helper.
 *
 * Replaces hardcoded hex colors in *.module.css files with the matching `--app-color-*`
 * token, for values that already have a token — it never invents a token mapping.
 * Colors with no match are left untouched and reported, since deciding whether they
 * deserve a new token (or are a genuine one-off) is a human call, not this script's.
 *
 * Token mapping is parsed live from src/index.css, so it never drifts out of sync with
 * the actual token set. When a primitive maps to exactly one semantic token, the
 * semantic name is used (e.g. `--app-color-text-primary`); when a primitive has no
 * semantic or maps to more than one (ambiguous — depends on usage, not just the value),
 * the primitive itself is used (e.g. `--app-color-gray-primary`) so the migration stays
 * correct rather than guessing intent.
 *
 * Usage:
 *   node scripts/migrate-hardcoded-colors.js <dir-or-glob>            # dry run (report only)
 *   node scripts/migrate-hardcoded-colors.js <dir-or-glob> --write    # apply in place
 *
 * Example:
 *   node scripts/migrate-hardcoded-colors.js src/components/UI --write
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const INDEX_CSS_PATH = path.join(REPO_ROOT, 'src', 'index.css');

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

function parseTokenMap() {
  const css = readFileSync(INDEX_CSS_PATH, 'utf8');
  const rootBlockMatch = css.match(/:root\s*{([^}]*)}/s);
  if (!rootBlockMatch) throw new Error('Could not find a :root {} block in src/index.css');
  const body = rootBlockMatch[1];

  const primitiveNameByHex = new Map(); // '#119656' -> 'green-primary'
  const semanticsByPrimitive = new Map(); // 'green-primary' -> ['brand-primary']

  for (const line of body.split('\n')) {
    const primitiveMatch = line.match(/--app-color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/);
    if (primitiveMatch) {
      primitiveNameByHex.set(primitiveMatch[2].toLowerCase(), primitiveMatch[1]);
      continue;
    }
    const semanticMatch = line.match(/--app-color-([a-z0-9-]+):\s*var\(--app-color-([a-z0-9-]+)\)\s*;/);
    if (semanticMatch) {
      const [, semanticName, primitiveName] = semanticMatch;
      if (!semanticsByPrimitive.has(primitiveName)) semanticsByPrimitive.set(primitiveName, []);
      semanticsByPrimitive.get(primitiveName).push(semanticName);
    }
  }

  // hex -> the token name to use (semantic if exactly one, else the primitive)
  const tokenNameByHex = new Map();
  for (const [hex, primitiveName] of primitiveNameByHex) {
    const semantics = semanticsByPrimitive.get(primitiveName) || [];
    tokenNameByHex.set(hex, semantics.length === 1 ? semantics[0] : primitiveName);
  }
  return tokenNameByHex;
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
    console.error('Usage: node scripts/migrate-hardcoded-colors.js <dir-or-glob> [--write]');
    process.exit(1);
  }

  const targetPath = path.resolve(REPO_ROOT, target);
  const tokenNameByHex = parseTokenMap();
  const files = statSync(targetPath).isDirectory() ? walk(targetPath) : [targetPath];

  let filesChanged = 0;
  let replacementsMade = 0;
  const unmatched = new Map(); // hex -> count, across all scanned files

  for (const file of files) {
    const original = readFileSync(file, 'utf8');
    let fileReplacements = 0;
    const updated = original.replace(HEX_RE, (hex) => {
      const lower = hex.toLowerCase();
      const tokenName = tokenNameByHex.get(lower);
      if (!tokenName) {
        unmatched.set(lower, (unmatched.get(lower) || 0) + 1);
        return hex;
      }
      fileReplacements += 1;
      return `var(--app-color-${tokenName})`;
    });

    if (fileReplacements > 0) {
      filesChanged += 1;
      replacementsMade += fileReplacements;
      const relPath = path.relative(REPO_ROOT, file);
      console.log(`${shouldWrite ? 'Updated' : 'Would update'} ${relPath} (${fileReplacements} replacement(s))`);
      if (shouldWrite) writeFileSync(file, updated);
    }
  }

  console.log(`\n${filesChanged} file(s), ${replacementsMade} replacement(s) ${shouldWrite ? 'made' : 'available'}.`);

  if (unmatched.size > 0) {
    console.log('\nHex values with no token yet (left untouched — needs a human decision):');
    const sorted = [...unmatched.entries()].sort((a, b) => b[1] - a[1]);
    for (const [hex, count] of sorted) console.log(`  ${hex}  (${count}x)`);
  }

  if (!shouldWrite && filesChanged > 0) {
    console.log('\nDry run only — re-run with --write to apply.');
  }
}

main();
