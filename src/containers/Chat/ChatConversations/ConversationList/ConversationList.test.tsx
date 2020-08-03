import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, wait, fireEvent } from '@testing-library/react';
import ConversationList from './ConversationList';
import { MockedProvider } from '@apollo/client/testing';
import { ChatConversationMocks, conversations } from './../ChatConversations.test.helper';

const mocks = ChatConversationMocks;

const conversationList = (conversation: any) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ConversationList
        searchVal=""
        selectedContactId={2}
        setSelectedContactId={jest.fn()}
        savedSearchCriteria=""
        conversations={conversation}
      />
    </Router>
  </MockedProvider>
);

test('it should render ConversationsList properly', () => {
  const { container } = render(conversationList(conversations));
  expect(container).toBeInTheDocument();
});

test('it shows error if conversations are undefined', () => {
  const { getByText } = render(conversationList(undefined));
  expect(getByText('Error :(')).toBeInTheDocument();
});

test('it shows a conversation on clicking a contact', () => {
  const { getAllByTestId, getByText } = render(conversationList(conversations));
  fireEvent.click(getAllByTestId('list')[0]);
  expect(getByText('Hi')).toBeInTheDocument();
});
