export interface MarkdownTable {
  header: string[];
  rows: string[][];
}

export type MarkdownBlock = { type: 'text'; content: string } | { type: 'table'; table: MarkdownTable };
