import React from 'react';
import { render, wait, act, within } from '@testing-library/react';

import { MockedProvider } from '@apollo/client/testing';
import { ChatMessages } from './ChatMessages';
import { mocksWithConversation, mocksWithMultipleMessages } from '../../../mocks/Chat';
import { fireEvent } from '@testing-library/dom';
import { MemoryRouter } from 'react-router';

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
  <MemoryRouter>
    <MockedProvider mocks={mocksWithConversation} addTypename={false}>
      <ChatMessages contactId={'2'} />
    </MockedProvider>
  </MemoryRouter>
);





it('should have title as contact name', async () => {
  const { getByTestId } = render(chatMessages);
  await wait();
  await wait();
  expect(getByTestId('beneficiaryName')).toHaveTextContent('Effie Cormier');
});

it('should have an emoji picker', async () => {
  const { getByTestId } = render(chatMessages);
  await wait();
  await wait();
  expect(getByTestId('emoji-picker')).toBeInTheDocument();
});

it('should contain the mock message', async () => {
  const { getByText } = render(chatMessages);
  await wait();
  await wait();
  expect(getByText('Hey')).toBeInTheDocument();
});

test('click on assign tag should open a dialog box with already assigned tags', async () => {
  const { getByTestId, getByText } = render(chatMessages);
  await wait();
  await wait();

  fireEvent.click(getByTestId('messageOptions'));
  await wait();
  act(() => {
    fireEvent.click(getByTestId('dialogButton'));
  });
  await wait();
  expect(getByTestId('dialogBox')).toHaveTextContent('important');
});

test('assigned tags should be shown in searchbox', async () => {
  const { getByTestId } = render(chatMessages);
  await wait();
  await wait();
  fireEvent.click(getByTestId('messageOptions'));
  await wait();
  act(() => {
    fireEvent.click(getByTestId('dialogButton'));
  });
  await wait();
  const searchBox = within(getByTestId('AutocompleteInput'));
  expect(searchBox.getByText('important')).toBeInTheDocument();
});

test('remove already assigned tags', async () => {
  const { getByTestId } = render(chatMessages);
  await wait();
  await wait();
  fireEvent.click(getByTestId('messageOptions'));
  await wait();
  act(() => {
    fireEvent.click(getByTestId('dialogButton'));
  });
  await wait();
  const searchBox = within(getByTestId('AutocompleteInput'));
  fireEvent.click(searchBox.getByTestId('deleteIcon'));
});

test('focus on the latest message', async () => {
  const { getByTestId } = render(chatMessages);
  await wait();
  await wait();
  const message = getByTestId('message');
  expect(message.scrollIntoView).toBeCalled();
});

test('chat having multiple messages', async () => {
  const { getByText } = render(
    <MemoryRouter>
      <MockedProvider mocks={mocksWithMultipleMessages} addTypename={false}>
        <ChatMessages contactId={'2'} />
      </MockedProvider>
    </MemoryRouter>
  );
  await wait();
  await wait();
  expect(getByText('Yo')).toBeInTheDocument();
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
