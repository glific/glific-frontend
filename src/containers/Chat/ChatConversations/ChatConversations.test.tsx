import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, wait, fireEvent, cleanup } from '@testing-library/react';
import ChatConversations from './ChatConversations';
import { MockedProvider } from '@apollo/client/testing';
import { ChatConversationMocks } from './ChatConversations.test.helper';

const mocks = ChatConversationMocks;

afterEach(cleanup);
const chatConversation = (
  <MockedProvider mocks={mocks}>
    <Router>
      <ChatConversations contactId={6} />
    </Router>
  </MockedProvider>
);

test('it should render <ChatConversations /> component correctly', async () => {
  const { container } = render(chatConversation);
  await wait();
  expect(container).toBeInTheDocument();
});

test('it should filter contacts based on search', async () => {
  const { getByTestId } = render(chatConversation);
  await wait();
  fireEvent.change(getByTestId('searchInput').querySelector('input'), { target: { value: 'a' } });
  await wait();
  fireEvent.submit(getByTestId('searchForm'));
  await wait();
});

test('it should reset input on clicking cross icon', async () => {
  const { getByTestId, getByText } = render(chatConversation);
  await wait();
  fireEvent.change(getByTestId('searchInput').querySelector('input'), { target: { value: 'a' } });
  await wait();
  const resetButton = getByTestId('resetButton');
  fireEvent.click(resetButton);
  await wait();
  expect(getByText('Red Sparrow')).toBeInTheDocument();
});

test('it should load all contacts with unread tag', async () => {
  const { getAllByTestId, getByText } = render(chatConversation);
  await wait();
  fireEvent.click(getAllByTestId('savedSearchDiv')[0]);
  await wait();
  await wait();
  expect(getByText('You do not have any conversations.')).toBeInTheDocument();
});
