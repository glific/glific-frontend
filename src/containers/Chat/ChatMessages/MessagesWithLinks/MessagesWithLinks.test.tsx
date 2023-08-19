import { MessagesWithLinks } from './MessagesWithLinks';
import { render, screen, waitFor } from '@testing-library/react';

const messagesWithLinks = <MessagesWithLinks message={'hey there google.com'} />;

test('it renders correctly', async () => {
  const { getByText } = render(messagesWithLinks);
  await waitFor(() => {
    expect(getByText('hey there')).toBeInTheDocument();
  });
});

test('it renders links message', async () => {
  render(<MessagesWithLinks message="https://www.google.com" />);
  await waitFor(() => {
    expect(screen.getByText('https://www.google.com')).toBeInTheDocument();
  });
});
