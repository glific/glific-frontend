import { render, screen } from '@testing-library/react';
import { EmojiInput } from './EmojiInput';

import userEvent from '@testing-library/user-event';
import { LexicalWrapper } from 'common/LexicalWrapper';

const setFieldValueMock = vi.fn();

const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

(window as any).IntersectionObserver = mockIntersectionObserver;

const wrapper = (
  <LexicalWrapper>
    <EmojiInput
      form={{
        touched: false,
        errors: {},
        values: { input: '' },
        setFieldValue: setFieldValueMock,
      }}
      field={{ name: 'input', value: '', onChange: vi.fn() }}
      label="Title"
      placeholder="Title"
      rows={10}
    />
  </LexicalWrapper>
);

vi.mock('components/UI/EmojiPicker/EmojiPicker', async (importOriginal) => {
  const mod = await importOriginal<typeof import('components/UI/EmojiPicker/EmojiPicker')>();
  return {
    ...mod,
    EmojiPicker: vi.fn((props: any) => {
      const mockEmoji = {
        id: 'grinning',
        name: 'Grinning Face',
        colons: ':grinning:',
        text: '',
        emoticons: [],
        skin: null,
        native: '😀',
      };
      const Picker: any = (
        <input
          data-testid="emoji-container"
          onClick={() => {
            props.onEmojiSelect(mockEmoji);
          }}
          onChange={(event) => props.onChange(event)}
        ></input>
      );
      return Picker;
    }),
  };
});

it('renders <EmojiInput /> component', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('editor-input')).toBeInTheDocument();
});

it('should have a emoji picker', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('emoji-picker')).toBeInTheDocument();
});

// since we are mocking emoji-picker we need to implement the following functionalities

test('clicking on emoji picker should open a container to select emojis', async () => {
  const user = userEvent.setup();
  const { getByTestId } = render(wrapper);
  await user.click(getByTestId('emoji-picker'));
  expect(screen.getByTestId('emoji-container')).toBeInTheDocument();
});

test('Selecting an emoji should update in the editor', async () => {
  // mockDraftJs(done);
  const user = userEvent.setup();
  const { getByTestId } = render(wrapper);
  await user.click(getByTestId('emoji-picker'));
  const emojiContainer = screen.getByTestId('emoji-container');
  await user.click(emojiContainer);
});
