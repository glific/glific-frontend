import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { mount, shallow } from 'enzyme';
import ChatConversations from './ChatConversations';
import { MockedProvider } from '@apollo/client/testing';
import { GET_CONVERSATION_MESSAGE_QUERY } from '../../../graphql/queries/Chat';

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
            name: 'Jane Doe',
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
                  id: '1',
                  label: 'important',
                },
              ],
            },
          ],
        },
      },
    },
  },
];

describe('<ChatConversations />', () => {
  test('it should render <ChatConversations /> component correctly', () => {
    const wrapper = shallow(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatConversations />
      </MockedProvider>
    );
    expect(wrapper.exists()).toBe(true);
  });

  // TODO: Need to implement comprehensive test cases for this component
});
