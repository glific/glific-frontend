import { render } from '@testing-library/react';
import { EmojiPicker } from './EmojiPicker';

const onEmojiSelectMock = vi.fn();

const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

(window as any).IntersectionObserver = mockIntersectionObserver;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
  },
});

const dialogBox = (
  <EmojiPicker displayStyle={{ width: '100%' }} onEmojiSelect={onEmojiSelectMock} />
);

test('it should render emoji picker', () => {
  const { getByTestId } = render(dialogBox);
  expect(getByTestId('emoji-container')).toBeInTheDocument();
});
