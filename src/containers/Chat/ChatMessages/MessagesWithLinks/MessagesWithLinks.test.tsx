import { MessagesWithLinks } from './MessagesWithLinks';
import { render } from '@testing-library/react';

const messagesWithLinks = <MessagesWithLinks message={'hey there google.com'} />;

test('it renders correctly', () => {
  const { getByText } = render(messagesWithLinks);
  expect(getByText('hey there')).toBeInTheDocument();
});

test('it renders links message', () => {
  render(<MessagesWithLinks message="https://www.google.com" />);
});
