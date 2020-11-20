import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, wait, fireEvent, waitFor } from '@testing-library/react';
import ConversationList from './ConversationList';
import { MockedProvider } from '@apollo/client/testing';
import { ChatConversationMocks } from './../ChatConversations.test.helper';

const mocks = ChatConversationMocks;

const conversationList = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ConversationList
        searchVal=""
        selectedContactId={2}
        setSelectedContactId={jest.fn()}
        savedSearchCriteria=""
        searchMode={false}
      />
    </Router>
  </MockedProvider>
);

test('it should render ConversationsList properly', async () => {
  const { container } = render(conversationList);
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});

test('it shows a conversation on clicking a contact', async () => {
  const { getAllByTestId, getByText } = render(conversationList);
  await waitFor(() => {
    fireEvent.click(getAllByTestId('list')[0]);
  });
  expect(getByText('Hi')).toBeInTheDocument();
});
