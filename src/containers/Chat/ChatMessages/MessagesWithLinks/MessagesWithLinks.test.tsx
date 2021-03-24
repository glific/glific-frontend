import React from 'react';
import { MessagesWithLinks } from './MessagesWithLinks';
import { render } from '@testing-library/react';

const messagesWithLinks = <MessagesWithLinks message={'hey there google.com'} />;

test('it renders correctly', () => {
  const { getByText } = render(messagesWithLinks);
  expect(getByText('hey there google.com')).toBeInTheDocument();
});
