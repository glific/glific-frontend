import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Login } from './components/pages/Login/Login';
import App from './App';
import Chat from './containers/Chat/Chat';
import {
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
} from './graphql/subscriptions/Chat';
import { GET_CONVERSATION_QUERY } from './graphql/queries/Chat';

const mocks = [
  {
    request: {
      query: MESSAGE_RECEIVED_SUBSCRIPTION,
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
        receivedMessage: {
          body: 'hi',
          flow: 'INBOUND',
          id: '10402',
          receiver: {
            id: '1',
            phone: '917834811114',
          },
          sender: {
            id: '507',
            phone: '919967660447',
          },
          type: 'TEXT',
        },
      },
    },
  },
  {
    request: {
      query: MESSAGE_SENT_SUBSCRIPTION,
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
      sentMessage: {
        body: 'hello',
        flow: 'OUTBOUND',
        id: '10405',
        receiver: {
          id: '507',
          phone: '919967660447',
        },
        sender: {
          id: '1',
          phone: '917834811114',
        },
        type: 'TEXT',
      },
    },
  },
];

describe('<App /> ', () => {
  test('it should render <App /> component correctly', () => {
    const wrapper = shallow(<App />);
    expect(wrapper.exists()).toBe(true);
  });

  test('it should render <Login /> component by default', () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(wrapper.find(Login)).toHaveLength(1);
  });
});
