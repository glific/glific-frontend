import { downloadFile } from 'common/utils';

/** RFC 4180: Quote fields containing delimiters, quotes, or line breaks, escaping quotes by doubling them. */
const escapeCell = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export const toCsv = (rows: string[][]) => rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');

export const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  downloadFile(URL.createObjectURL(blob), filename);
};
