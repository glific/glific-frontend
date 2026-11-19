import { contrastRatio, isHexColour, isNearWhite, readableOn } from './branding';

// The same cases as the backend's Branding.readable_on/1 tests, so a drift between the two shows
// up here rather than as a preview that disagrees with the chat.
test('flips to dark text on a light colour and light text on a dark one', () => {
  expect(readableOn('#ffffff')).toBe(readableOn('#ffb900'));
  expect(readableOn('#ffffff')).not.toBe(readableOn('#18181b'));
});

test('picks the dark text for the default Glific green, as the server does', () => {
  expect(readableOn('#119656')).toBe('#18181b');
});

test('clears WCAG AA against the colour it was chosen for', () => {
  ['#ffffff', '#000000', '#119656', '#eab308', '#ff6900', '#4c3bcf'].forEach((colour) => {
    expect(contrastRatio(colour, readableOn(colour))).toBeGreaterThanOrEqual(4.5);
  });
});

test('treats white and pale tints as near white, but not light saturated colours', () => {
  ['#ffffff', '#f5f5f5', '#fff8e7'].forEach((colour) => expect(isNearWhite(colour)).toBe(true));
  ['#ffff00', '#98ff98', '#eab308', '#119656'].forEach((colour) => expect(isNearWhite(colour)).toBe(false));
});

test('accepts only six-digit hex colours', () => {
  expect(isHexColour('#4C3BCF')).toBe(true);
  expect(isHexColour('#abc')).toBe(false);
  expect(isHexColour('')).toBe(false);
});
