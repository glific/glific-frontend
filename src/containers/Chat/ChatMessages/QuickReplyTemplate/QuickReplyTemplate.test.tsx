import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QuickReplyTemplate } from './QuickReplyTemplate';

const options = [
  {
    type: 'text',
    title: 'First',
  },
  {
    type: 'text',
    title: 'Second',
  },
  {
    type: 'text',
    title: 'Third',
  },
];

const content = {
  type: 'image',
  url: 'https://picsum.photos/200/300',
  caption: 'body text',
};

const props: any = {
  type: 'quick_reply',
  content,
  options,
  onQuickReplyClick: jest.fn(),
};

test('it renders QuickReplyTemplate on simulator with image', async () => {
  props.isSimulator = true;
  render(<QuickReplyTemplate {...props} />);

  const button = screen.getByRole('button', { name: 'First' });
  expect(button).toBeInTheDocument();
  fireEvent.click(button);

  await waitFor(() => {});

  const mockBtnCallback = props.onQuickReplyClick;
  expect(mockBtnCallback).toBeCalledTimes(1);
});

test('it renders QuickReplyTemplate on chat screen', async () => {
  props.disabled = true;
  render(<QuickReplyTemplate {...props} />);
});

const textContent = {
  type: 'text',
  caption: 'body text',
};

test('it renders QuickReplyTemplate on simulator with text', async () => {
  props.content = textContent;
  props.isSimulator = true;
  render(<QuickReplyTemplate {...props} />);

  const button = screen.getByRole('button', { name: 'First' });
  expect(button).toBeInTheDocument();
  fireEvent.click(button);
});
