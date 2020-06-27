import React from 'react';
import { render, wait, screen, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_TAGS_COUNT, FILTER_TAGS, GET_LANGUAGES } from '../../../graphql/queries/Tag';
import { ChatMessages } from './ChatMessages';
import { GET_CONVERSATION_MESSAGE_QUERY } from '../../../graphql/queries/Chat';
import { CREATE_MESSAGE_MUTATION } from '../../../graphql/mutations/Chat';
import { GET_TAGS } from '../../../graphql/queries/Tag';
import { Switch, Route } from 'react-router-dom';
import { within, fireEvent } from '@testing-library/dom';
import { CREATE_MESSAGE_TAG } from '../../../graphql/mutations/Chat';

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

const mocks = [
  {
    request: {
      query: GET_CONVERSATION_MESSAGE_QUERY,
      variables: { contactId: '2', filter: {}, messageOpts: { limit: 25 } },
    },
    result: {
      data: {
        conversation: {
          contact: {
            id: '2',
            name: 'Vaibhav',
          },
          messages: [
            {
              id: '1',
              body: 'Hey there whats up?',
              insertedAt: '2020-06-25T13:36:43Z',
              receiver: {
                id: '2',
              },
              sender: {
                id: '1',
              },
              tags: [
                {
                  id: 1,
                  label: 'important',
                },
              ],
            },
          ],
        },
      },
    },
  },

  {
    request: {
      query: GET_TAGS,
    },
    result: {
      data: {
        tags: [
          {
            id: '87',
            label: 'Good message',
            description: 'Hey There',
          },
          {
            id: '94',
            label: 'Message',
            description: 'some description',
          },
        ],
      },
    },
  },
  {
    request: {
      query: CREATE_MESSAGE_MUTATION,
      variables: {
        input: {
          body: 'Hey There Wow',
          senderId: 1,
          receiverId: '2',
          type: 'TEXT',
          flow: 'OUTBOUND',
        },
      },
    },
    result: {
      data: {
        createMessage: {
          message: {
            body: 'Hey There Wow',
            insertedAt: '2020-06-25T13:36:43Z',
            id: '10388',
            receiver: {
              id: '2',
            },
            sender: {
              id: '1',
            },

            tags: [
              {
                id: 1,
                label: 'critical',
              },
            ],
          },
        },
      },
    },
  },
];

describe('<ChatMessages />', () => {
  it('should have loading state', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages contactId="2" />
      </MockedProvider>
    );
    expect(getByText('Loading...')).toBeInTheDocument();
    await wait();
  });

  it('should have title as contact name', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages contactId="2" />
      </MockedProvider>
    );
    await wait();
    expect(getByTestId('name')).toHaveTextContent('Vaibhav');
  });

  test('input should function properly', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages contactId="2" />
      </MockedProvider>
    );
    await wait();
    fireEvent.change(getByTestId('message-input'), {
      target: { value: 'Hey There' },
    });
    expect(getByTestId('message-input').getAttribute('value')).toBe('Hey There');
  });

  it('should have an emoji picker', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages contactId="2" />
      </MockedProvider>
    );
    await wait();
    expect(getByTestId('emoji-picker')).toBeInTheDocument();
  });

  it('should contain the mock message', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages contactId="2" />
      </MockedProvider>
    );
    await wait();
    expect(getByTestId('content')).toHaveTextContent('Hey there whats up?');
  });

  test('click on assign tag should open a dialog box with mock messages', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages contactId="2" />
      </MockedProvider>
    );
    await wait();
    fireEvent.click(getByTestId('messageOptions'));
    await wait();
    fireEvent.click(getByTestId('dialogButton'));
    await wait();
    expect(screen.getByTestId('dialogBox')).toHaveTextContent('Good message');
  });

  test('add a new message on submit to input box', async () => {
    const { getAllByTestId, getByTestId, rerender } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages contactId="2" />
      </MockedProvider>
    );
    await wait();
    fireEvent.change(getByTestId('message-input'), {
      target: { value: 'Hey There Wow' },
    });
    await wait();
    fireEvent.keyPress(getByTestId('message-input'), { key: 'Enter', code: 13, charCode: 13 });
    await wait();
    expect(getByTestId('messageContainer')).toHaveTextContent('Hey There Wow');
  });
});
