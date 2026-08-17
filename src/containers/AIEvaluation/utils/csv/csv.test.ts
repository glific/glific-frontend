import { downloadFile } from 'common/utils';
import { downloadCsv, toCsv } from './csv';

vi.mock('common/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('common/utils')>()),
  downloadFile: vi.fn(),
}));

describe('toCsv', () => {
  test('joins plain cells with commas and rows with CRLF', () => {
    expect(
      toCsv([
        ['Question', 'Score'],
        ['Q1', '4'],
      ])
    ).toBe('Question,Score\r\nQ1,4');
  });

  test('quotes cells holding a comma, a quote or a line break', () => {
    expect(toCsv([['first, second', 'she said "hi"', 'line one\nline two']])).toBe(
      '"first, second","she said ""hi""","line one\nline two"'
    );
  });

  test('leaves a cell that needs no quoting untouched', () => {
    expect(toCsv([["it's fine — 5/5", '']])).toBe("it's fine — 5/5,");
  });
});

/** jsdom's Blob has neither text() nor arrayBuffer(), so it is read the long way round */
const readBlob = (blob: Blob) =>
  new Promise<Uint8Array>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  });

describe('downloadCsv', () => {
  test('hands the browser a UTF-8 CSV blob under the given name', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:csv');

    downloadCsv('results.csv', 'Question,Score\r\nक्या यह ठीक है?,5');

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/csv;charset=utf-8;');

    const bytes = await readBlob(blob);
    // the file opens with a BOM, so a spreadsheet reads the Devanagari rather than a local codepage
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes.slice(3))).toBe('Question,Score\r\nक्या यह ठीक है?,5');
    expect(downloadFile).toHaveBeenCalledWith('blob:csv', 'results.csv');
  });
});
