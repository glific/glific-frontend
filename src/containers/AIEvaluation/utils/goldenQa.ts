import type { GoldenQaRow } from 'containers/AIEvaluation/types/goldenQaType';

export const GOLDEN_QA_COLUMNS = ['question', 'answer', 'category'];

const DELIMITERS = [',', ';', '\t'];

/**
 * Excel writes a semicolon-separated file in locales where the comma is the decimal mark, and
 * still calls it .csv — so the separator is taken from the header rather than assumed.
 */
const sniffDelimiter = (text: string) => {
  const header = text.slice(0, text.search(/\r?\n/) === -1 ? text.length : text.search(/\r?\n/));
  return DELIMITERS.reduce((winner, candidate) =>
    header.split(candidate).length > header.split(winner).length ? candidate : winner
  );
};

const readRows = (text: string, delimiter: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char !== '"') {
        field += char;
      } else if (text[index + 1] === '"') {
        // "" is how a quote escapes itself inside a quoted field
        field += '"';
        index += 1;
      } else {
        quoted = false;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      rows.push(row);
      field = '';
      row = [];
    } else {
      field += char;
    }
  }

  row.push(field);
  rows.push(row);

  // trailing newlines and blank lines between records are not records
  return rows.filter((entry) => entry.some((cell) => cell.trim() !== ''));
};

/**
 * Reads a Golden Q&A file into rows. The header is optional — a file that starts straight
 * into questions is still readable, so a first row is only dropped when it names the columns.
 */
export const parseGoldenQaCsv = (text: string): GoldenQaRow[] => {
  const rows = readRows(text, sniffDelimiter(text));
  if (rows.length === 0) return [];

  const isHeader = rows[0][0]?.trim().toLowerCase() === GOLDEN_QA_COLUMNS[0];
  const body = isHeader ? rows.slice(1) : rows;

  // readRows always yields at least one cell, so only the trailing columns can be absent
  return body
    .map((cells) => ({
      question: cells[0].trim(),
      answer: (cells[1] || '').trim(),
      category: (cells[2] || '').trim(),
    }))
    .filter((row) => row.question !== '');
};

export const goldenQaCategories = (rows: GoldenQaRow[]) => [
  ...new Set(rows.map((row) => row.category).filter(Boolean)),
];

export const downloadFromUrl = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const isValidGoldenQaName = (name: string) => /^[a-z0-9_]+$/.test(name);

export const suggestedGoldenQaName = (filename: string) =>
  filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
