import React from 'react';
import { render, wait, screen, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_TAGS_COUNT, FILTER_TAGS, GET_LANGUAGES } from '../../../graphql/queries/Tag';
import { ChatMessages } from './ChatMessages';
import { GET_CONVERSATION_MESSAGE_QUERY } from '../../../graphql/queries/Chat';
import { GET_TAGS } from '../../../graphql/queries/Tag';
import { Switch, Route } from 'react-router-dom';
import { within, fireEvent } from '@testing-library/dom';

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

afterEach(cleanup);
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
            id: 1,
            name: 'Vaibhav',
          },
          messages: [
            {
              id: 1,
              body: 'Hey there watsUp',
              insertedAt: '2020-06-25T13:36:43Z',
              receiver: {
                id: 2,
              },
              sender: {
                id: 1,
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
];

describe('<ChatMessages />', () => {
  it('should have loading', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages />
      </MockedProvider>
    );

    expect(getByText('Loading...')).toBeInTheDocument();
    await wait();
  });

  it('should have title as contact name', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages />
      </MockedProvider>
    );

    await wait();

    expect(getByTestId('name')).toHaveTextContent('Vaibhav');
  });

  it('input should function properly', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages />
      </MockedProvider>
    );

    await wait();

    fireEvent.change(getByTestId('message-input'), {
      target: { value: 'Hey There' },
    });

    expect(getByTestId('message-input').getAttribute('value')).toBe('Hey There');
  });

  it('input should have an emoji picker', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages />
      </MockedProvider>
    );

    await wait();

    expect(getByTestId('emoji-picker')).toBeInTheDocument();
  });

  it('It should contain the mock message', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages />
      </MockedProvider>
    );

    await wait();

    expect(getByTestId('content')).toHaveTextContent('Hey there watsUp');
  });

  test('click on assign tag should open a dialog box with mock messages', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages />
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
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatMessages />
      </MockedProvider>
    );

    await wait();
    fireEvent.change(getByTestId('message-input'), {
      target: { value: 'Hey There Wow' },
    });
    fireEvent.keyDown(getByTestId('message-input'), { key: 'Enter', code: 'Enter' });

    await wait();

    expect(getByTestId('content')).toHaveTextContent('Hey there watUp');
  });
});
