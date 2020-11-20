import React from 'react';
import { MessagesWithLinks } from './MessagesWithLinks';
import { render} from "@testing-library/react"

const messagesWithLinks = <MessagesWithLinks message={'hey There google.com'} />;

test('it renders correctly', () => {
  const {getByTestId} = render(messagesWithLinks);
  expect(getByTestId('messageLink')).toBeInTheDocument();
});
