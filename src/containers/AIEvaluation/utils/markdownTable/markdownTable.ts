export interface MarkdownTable {
  header: string[];
  rows: string[][];
}

export type MarkdownBlock = { type: 'text'; content: string } | { type: 'table'; table: MarkdownTable };

/** `| --- | :--: |` — the row that turns the line above it into a header */
const isDelimiterRow = (line: string) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-');

const isTableRow = (line: string) => line.includes('|');

/** `| a | b |` → ['a', 'b'], dropping the empties either side of the outer pipes */
const readCells = (line: string) => {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
};

/**
 * Splits an answer into plain-markdown stretches and the pipe tables between them.
 *
 * Tables are a GitHub extension that the markdown renderer does not handle, so they would
 * otherwise reach the reader as a wall of pipes. Rather than pull in a plugin, the tables are
 * lifted out here and rendered as real tables, and everything else is left to the renderer.
 */
export const splitMarkdownTables = (text: string): MarkdownBlock[] => {
  const lines = text.split('\n');
  const blocks: MarkdownBlock[] = [];
  let plain: string[] = [];

  const flushPlain = () => {
    const content = plain.join('\n').trim();
    if (content) blocks.push({ type: 'text', content });
    plain = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const next = lines[index + 1] ?? '';

    if (isTableRow(line) && isDelimiterRow(next)) {
      const header = readCells(line);
      const rows: string[][] = [];

      let cursor = index + 2;
      while (cursor < lines.length && isTableRow(lines[cursor]) && lines[cursor].trim() !== '') {
        rows.push(readCells(lines[cursor]));
        cursor += 1;
      }

      flushPlain();
      blocks.push({ type: 'table', table: { header, rows } });
      index = cursor - 1;
      continue;
    }

    plain.push(line);
  }

  flushPlain();
  return blocks;
};
