import '../../../../matchMediMock';
import { render } from '@testing-library/react';
import { EmojiInput } from './EmojiInput';
import userEvent from '@testing-library/user-event';

const setFieldValueMock = vi.fn();

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
      values: { input: '' },
      setFieldValue: setFieldValueMock,
    }}
    field={{ name: 'input', value: '', onChange: vi.fn() }}
    label="Title"
    placeholder="Title"
    rows={10}
  />
);
it('renders <EmojiInput /> component', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('editor')).toBeInTheDocument();
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
});
