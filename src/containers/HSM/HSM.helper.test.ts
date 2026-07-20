import { getVariables, getExampleFromBody } from './HSM.helper';

describe('getVariables', () => {
  test('keys each variable by the number captured from the message, not by its position', () => {
    const message = 'ASFA\nASD {{4}} {{5}}';
    const variables = [{ id: 4, text: 'foo' }];

    const result = getVariables(message, variables);

    expect(result).toEqual([
      { id: 4, text: 'foo' },
      { id: 5, text: '' },
    ]);
  });

  test('deduplicates a variable number that appears more than once in the message', () => {
    const message = 'ASFA\nASD {{4}} {{5}} {{4}}';

    const result = getVariables(message, []);

    expect(result).toEqual([
      { id: 4, text: '' },
      { id: 5, text: '' },
    ]);
  });

  test('returns an empty array when the message has no variable placeholders', () => {
    expect(getVariables('no variables here', [])).toEqual([]);
  });
});

describe('getExampleFromBody', () => {
  test('substitutes the example text by matching the variable id, not the position in the array', () => {
    const body = 'Hi {{4}}, your order {{5}} shipped';
    const variables = [
      { id: 4, text: 'Alex' },
      { id: 5, text: '12345' },
    ];

    expect(getExampleFromBody(body, variables)).toBe('Hi [Alex], your order [12345] shipped');
  });

  test('leaves the placeholder untouched when no example value has been entered for it', () => {
    const body = 'Hi {{4}}';
    expect(getExampleFromBody(body, [{ id: 4, text: '' }])).toBe('Hi {{4}}');
  });
});
