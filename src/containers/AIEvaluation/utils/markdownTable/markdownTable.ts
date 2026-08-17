import type { MarkdownBlock } from 'containers/AIEvaluation/types/markdownTableType';

const isDelimiterRow = (line: string) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-');

const isTableRow = (line: string) => line.includes('|');

const readCells = (line: string) => {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
};

/**
 * Splits an answer into plain-markdown stretches and the pipe tables between them.
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
