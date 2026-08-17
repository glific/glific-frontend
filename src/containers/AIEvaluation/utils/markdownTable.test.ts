import { splitMarkdownTables } from './markdownTable';

test('text with no table is left as one block', () => {
  expect(splitMarkdownTables('Just **prose** here.')).toEqual([{ type: 'text', content: 'Just **prose** here.' }]);
});

test('a pipe table becomes a table block', () => {
  const text = ['| Feature | Innate |', '| --- | --- |', '| Onset | Immediate |', '| Memory | None |'].join('\n');

  expect(splitMarkdownTables(text)).toEqual([
    {
      type: 'table',
      table: {
        header: ['Feature', 'Innate'],
        rows: [
          ['Onset', 'Immediate'],
          ['Memory', 'None'],
        ],
      },
    },
  ]);
});

test('prose either side of a table is kept, in order', () => {
  const text = ['Here is a comparison:', '', '| A | B |', '| --- | --- |', '| 1 | 2 |', '', 'In simple terms.'].join(
    '\n'
  );
  const blocks = splitMarkdownTables(text);

  expect(blocks.map((block) => block.type)).toEqual(['text', 'table', 'text']);
  expect(blocks[0]).toMatchObject({ content: 'Here is a comparison:' });
  expect(blocks[2]).toMatchObject({ content: 'In simple terms.' });
});

test('alignment markers in the delimiter row are still a delimiter row', () => {
  const text = ['| A | B |', '| :--- | ---: |', '| 1 | 2 |'].join('\n');

  expect(splitMarkdownTables(text)[0].type).toBe('table');
});

test('a table without the outer pipes is read too', () => {
  const text = ['A | B', '--- | ---', '1 | 2'].join('\n');
  const blocks = splitMarkdownTables(text);

  expect(blocks[0]).toEqual({ type: 'table', table: { header: ['A', 'B'], rows: [['1', '2']] } });
});

test('a lone pipe in prose is not a table', () => {
  const text = 'Use the | character to separate fields.';

  expect(splitMarkdownTables(text).map((block) => block.type)).toEqual(['text']);
});

test('two tables in one answer are both read', () => {
  const text = ['| A |', '| --- |', '| 1 |', '', 'and', '', '| B |', '| --- |', '| 2 |'].join('\n');

  expect(splitMarkdownTables(text).map((block) => block.type)).toEqual(['table', 'text', 'table']);
});

test('cell text keeps its inline markdown for the renderer', () => {
  const text = ['| Feature |', '| --- |', '| **bold** |'].join('\n');
  const [block] = splitMarkdownTables(text);

  expect(block.type === 'table' && block.table.rows[0][0]).toBe('**bold**');
});
