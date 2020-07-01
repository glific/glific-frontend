import React from 'react';

import { shallow } from 'enzyme';
import Chat from './Chat';
import { GET_CONVERSATION_QUERY } from '../../graphql/queries/Chat';
import { MockedProvider } from '@apollo/client/testing';

const mocks = [
  {
    request: {
      query: GET_CONVERSATION_QUERY,
      variables: {
        contactOpts: {
          limit: 50,
        },
        filter: {},
        messageOpts: {
          limit: 100,
        },
      },
    },
    result: {
      data: {
        conversations: [
          {
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
                    id: '1',
                    label: 'important',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
];

describe('<Chat />', () => {
  const defaultProps = {
    conversationIndex: 1,
  };

  const wrapper = shallow(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Chat {...defaultProps} />
    </MockedProvider>
  );

  test('it should render <Chat /> component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
