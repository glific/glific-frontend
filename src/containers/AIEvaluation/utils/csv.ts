import { downloadFile } from 'common/utils';

/**
 * RFC 4180 — a field only needs quoting when it carries a delimiter, a quote or a line break,
 * and a quote inside a quoted field is written twice. Answers routinely contain commas and
 * newlines, so without this a single row would spill across several columns.
 */
const escapeCell = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export const toCsv = (rows: string[][]) => rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');

/**
 * The leading BOM is what makes a spreadsheet read the file as UTF-8. Questions are often in
 * Hindi or another Indic script, and Excel falls back to a local codepage without it, which
 * turns every non-ASCII answer into mojibake.
 */
export const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  downloadFile(URL.createObjectURL(blob), filename);
};
