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

const props = {
  type: 'quick_reply',
  content,
  options,
  onQuickReplyClick: jest.fn(),
  isSimulator: false,
};

test('it renders QuickReplyTemplate on chat screen', async () => {
  render(<QuickReplyTemplate {...props} />);
  const button = screen.getByRole('button', { name: 'First' });
  expect(button).toBeInTheDocument();
  fireEvent.click(button);

  await waitFor(() => {});
});

test('it renders QuickReplyTemplate on simulator', async () => {
  render(<QuickReplyTemplate {...props} />);

  const button = screen.getByRole('button', { name: 'First' });
  expect(button).toBeInTheDocument();
  fireEvent.click(button);

  await waitFor(() => {});
});
