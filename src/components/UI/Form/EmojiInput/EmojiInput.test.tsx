import { render, screen, fireEvent } from '@testing-library/react';
import { EmojiInput } from './EmojiInput';
import draftJs, { EditorState } from 'draft-js';
import userEvent from '@testing-library/user-event';

const setFieldValueMock = vi.fn();

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

const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

(window as any).IntersectionObserver = mockIntersectionObserver;

const wrapper = (
  <EmojiInput
    form={{
      touched: false,
      errors: {},
      values: { input: EditorState.createEmpty() },
      setFieldValue: setFieldValueMock,
    }}
    field={{ name: 'input', value: EditorState.createEmpty(), onChange: vi.fn() }}
    label="Title"
    placeholder="Title"
    rows={10}
  />
);

const mockCallback = vi.fn();

vi.spyOn(draftJs, 'Editor').mockImplementation((props: any, _context: any) => {
  const input: any = (
    <input
      data-testid='editor'
      onClick={() => {
        props.handleKeyCommand('underline', EditorState.createEmpty());
        mockCallback()
      }}
      onChange={() => props.onSearchChange({ value: "a" })}
    ></input>
  );
  return input;
});

vi.mock('components/UI/EmojiPicker/EmojiPicker', async (importOriginal) => {
  const mod = await importOriginal<typeof import('components/UI/EmojiPicker/EmojiPicker')>()
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
  }
})

const pushSpy = vi.spyOn(EditorState, 'push');


it('renders <EmojiInput /> component', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('input')).toBeInTheDocument();
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
  expect(pushSpy).toHaveBeenCalled();
})

test('testing underline key Command', () => {
  const { getByTestId } = render(wrapper);
  fireEvent.click(getByTestId('editor'));
  expect(mockCallback).toHaveBeenCalled();
})
