import React from 'react';
import { render, wait, act } from '@testing-library/react';

import { MockedProvider } from '@apollo/client/testing';

import { ChatMessages } from './ChatMessages';
import {
  mocksWithConversation,
  mocksWithMultipleMessages,
  mocksWithNoMessages,
} from './ChatMessage.test.helper';
import { fireEvent } from '@testing-library/dom';

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

window.HTMLElement.prototype.scrollIntoView = jest.fn();

const chatMessages = (
  <MockedProvider mocks={mocksWithConversation} addTypename={false}>
    <ChatMessages contactId={2} />
  </MockedProvider>
);

it('should have loading state', async () => {
  const { getByText } = render(chatMessages);
  expect(getByText('Loading...')).toBeInTheDocument();
  await wait();
});

it('should have title as contact name', async () => {
  const { getByTestId } = render(chatMessages);
  await wait();
  expect(getByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
});

it('should have an emoji picker', async () => {
  const { getByTestId } = render(chatMessages);
  await wait();
  expect(getByTestId('emoji-picker')).toBeInTheDocument();
});

it('should contain the mock message', async () => {
  const { getByText } = render(chatMessages);
  await wait();
  expect(getByText('Hey')).toBeInTheDocument();
});

test('click on assign tag should open a dialog box with mock messages', async () => {
  const { getByTestId } = render(chatMessages);
  await wait();
  fireEvent.click(getByTestId('messageOptions'));
  await wait();
  act(() => {
    fireEvent.click(getByTestId('dialogButton'));
  });
  await wait();
  expect(getByTestId('dialogBox')).toHaveTextContent('Good message');
});

test('assign a tag to message', async () => {
  const { getAllByTestId, getByTestId, getByText } = render(chatMessages);
  await wait();
  fireEvent.click(getByTestId('messageOptions'));
  await wait();
  act(() => {
    fireEvent.click(getByTestId('dialogButton'));
  });
  await wait();
  fireEvent.click(getAllByTestId('dialogCheckbox')[0]);
  fireEvent.click(getAllByTestId('dialogCheckbox')[1]);
  fireEvent.click(getByText('Save'));
  await wait();
  expect(getByText('important')).toBeInTheDocument();
});

test('focus on the latest message', async () => {
  const { container, getByTestId, getByText } = render(chatMessages);
  await wait();
  const message = getByTestId('message');
  expect(message.scrollIntoView).toBeCalled();
});

test('chat having no conversations', async () => {
  const { getByText } = render(
    <MockedProvider mocks={mocksWithNoMessages} addTypename={false}>
      <ChatMessages contactId={2} />
    </MockedProvider>
  );
  await wait();
  await wait();
  expect(getByText('No messages.')).toBeInTheDocument();
});

test('chat having multiple messages', async () => {
  const { getByText } = render(
    <MockedProvider mocks={mocksWithMultipleMessages} addTypename={false}>
      <ChatMessages contactId={2} />
    </MockedProvider>
  );
  await wait();
  expect(getByText('Yo')).toBeInTheDocument();
});

test('dialog box', async () => {
  const { getAllByText, getByText, getByTestId } = render(chatMessages);
  await wait();
  fireEvent.click(getByTestId('messageOptions'));
  await wait();
  act(() => {
    fireEvent.click(getByTestId('dialogButton'));
  });
  await wait();
  fireEvent.change(getByTestId('tagSearch').querySelector('input'), { target: { value: 'i' } });
  expect(getAllByText('important')[0]).toBeInTheDocument();
  fireEvent.click(getByText('Save'));
});

test('cancel after dialog box open', async () => {
  const { getByText, getByTestId } = render(chatMessages);
  await wait();
  fireEvent.click(getByTestId('messageOptions'));
  await wait();
  act(() => {
    fireEvent.click(getByTestId('dialogButton'));
  });
  await wait();
  fireEvent.click(getByText('Cancel'));
});
