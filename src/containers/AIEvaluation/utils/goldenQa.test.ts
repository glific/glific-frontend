import { downloadFromUrl, goldenQaCategories, parseGoldenQaCsv } from './goldenQa';

describe('parseGoldenQaCsv', () => {
  test('reads question, answer and category', () => {
    const rows = parseGoldenQaCsv('question,answer,category\nWhen is the first check-up?,In the first trimester.,ANC');

    expect(rows).toEqual([
      { question: 'When is the first check-up?', answer: 'In the first trimester.', category: 'ANC' },
    ]);
  });

  test('a file that starts straight into questions is still readable', () => {
    const rows = parseGoldenQaCsv('What is anaemia?,Low haemoglobin.,Nutrition');

    expect(rows).toHaveLength(1);
    expect(rows[0].question).toBe('What is anaemia?');
  });

  test('an answer may contain commas, quotes and line breaks', () => {
    const csv = [
      'question,answer,category',
      '"What foods help?","Eat greens, lentils and eggs.",Nutrition',
      '"What did she say?","She said ""take iron daily"".",Nutrition',
      '"List the signs","Bleeding\nSevere headache",Danger',
    ].join('\n');

    const rows = parseGoldenQaCsv(csv);

    expect(rows).toHaveLength(3);
    expect(rows[0].answer).toBe('Eat greens, lentils and eggs.');
    expect(rows[1].answer).toBe('She said "take iron daily".');
    expect(rows[2].answer).toBe('Bleeding\nSevere headache');
  });

  test('blank lines and a trailing newline are not questions', () => {
    const rows = parseGoldenQaCsv('question,answer,category\nQ1,A1,C1\n\n\nQ2,A2,C2\n');

    expect(rows.map((row) => row.question)).toEqual(['Q1', 'Q2']);
  });

  test('a row with no question is dropped, and missing columns are left empty', () => {
    const rows = parseGoldenQaCsv('question,answer,category\n,An answer with no question,C\nQ2,A2\nQ3');

    expect(rows).toEqual([
      { question: 'Q2', answer: 'A2', category: '' },
      { question: 'Q3', answer: '', category: '' },
    ]);
  });

  test('carriage returns from a Windows export are not part of the text', () => {
    const rows = parseGoldenQaCsv('question,answer,category\r\nQ1,A1,C1\r\n');

    expect(rows).toEqual([{ question: 'Q1', answer: 'A1', category: 'C1' }]);
  });

  test('an empty file has no questions', () => {
    expect(parseGoldenQaCsv('')).toEqual([]);
    expect(parseGoldenQaCsv('question,answer,category\n')).toEqual([]);
  });
});

describe('goldenQaCategories', () => {
  test('lists each category once, in the order it appears', () => {
    const rows = [
      { question: 'a', answer: '', category: 'ANC' },
      { question: 'b', answer: '', category: 'Nutrition' },
      { question: 'c', answer: '', category: 'ANC' },
      { question: 'd', answer: '', category: '' },
    ];

    expect(goldenQaCategories(rows)).toEqual(['ANC', 'Nutrition']);
  });
});

describe('downloadFromUrl', () => {
  test('clicks a link and cleans it up again', () => {
    const click = vi.fn();
    const link = { href: '', download: 'unset', click } as unknown as HTMLAnchorElement;
    const create = vi.spyOn(document, 'createElement').mockReturnValue(link);
    const append = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const remove = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    downloadFromUrl('https://files.example/set.csv');

    expect(link.href).toBe('https://files.example/set.csv');
    expect(click).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(link);

    create.mockRestore();
    append.mockRestore();
    remove.mockRestore();
  });
});

describe('separators other than a comma', () => {
  test('a semicolon file, as Excel writes it in some locales', () => {
    const rows = parseGoldenQaCsv('question;answer;category\nWhen is the check-up?;In the first trimester.;ANC');

    expect(rows).toEqual([{ question: 'When is the check-up?', answer: 'In the first trimester.', category: 'ANC' }]);
  });

  test('a tab-separated file', () => {
    const rows = parseGoldenQaCsv('question\tanswer\tcategory\nQ1\tA1\tC1');

    expect(rows).toEqual([{ question: 'Q1', answer: 'A1', category: 'C1' }]);
  });

  test('a comma inside a semicolon file stays part of the answer', () => {
    const rows = parseGoldenQaCsv('question;answer;category\nQ1;Eat greens, lentils and eggs.;Nutrition');

    expect(rows[0].answer).toBe('Eat greens, lentils and eggs.');
  });

  test('a single-column file is still read as questions', () => {
    const rows = parseGoldenQaCsv('question\nQ1\nQ2');

    expect(rows.map((row) => row.question)).toEqual(['Q1', 'Q2']);
  });

  test('a byte order mark from Excel is not part of the header', () => {
    const rows = parseGoldenQaCsv('﻿question,answer,category\nQ1,A1,C1');

    expect(rows).toEqual([{ question: 'Q1', answer: 'A1', category: 'C1' }]);
  });
});
