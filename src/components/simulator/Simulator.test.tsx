import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { Simulator } from './Simulator';
import { SEARCH_QUERY } from '../../graphql/queries/Search';
import { DEFAULT_CONTACT_LIMIT, DEFAULT_MESSAGE_LIMIT } from '../../common/constants';
import { MockedProvider } from '@apollo/client/testing';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { conversationQuery } from '../../mocks/Chat';
import {
  simulatorGetQuery,
  simulatorReleaseQuery,
  simulatorReleaseSubscription,
} from '../../mocks/Simulator';

const mockAxios: any = jest.genMockFromModule('axios');

// this is the key to fix the axios.create() undefined error!
mockAxios.create = jest.fn(() => mockAxios);

const mockSetShowSimulator = jest.fn();

const mocks = [
  conversationQuery,
  simulatorReleaseSubscription,
  simulatorReleaseQuery,
  simulatorGetQuery,
];
const defaultProps = {
  showSimulator: false,
  setShowSimulator: mockSetShowSimulator,
  setSimulatorId: mockSetShowSimulator,
  isPreviewMessage: false,
};

test('simulator should open on click of simulator icon', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...defaultProps} />
    </MockedProvider>
  );
  // To open simulator
  const button = getByTestId('simulatorIcon');

  await waitFor(() => {
    fireEvent.click(button);
    expect(mockSetShowSimulator).toHaveBeenCalledTimes(1);
  });
});

test('opened simulator should close when click of simulator icon', async () => {
  defaultProps.showSimulator = true;
  const { getByTestId, container } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...defaultProps} />
    </MockedProvider>
  );

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));

  // To open simulator
  const button = getByTestId('simulatorIcon');

  await waitFor(() => {
    fireEvent.click(button);
    expect(mockSetShowSimulator).toHaveBeenCalledTimes(1);
  });
});

// test('send a message from the simulator', async () => {
//   defaultProps.showSimulator = true;
//   const { getByTestId } = render(
//     <MockedProvider mocks={mocks}>
//       <Simulator {...defaultProps} />
//     </MockedProvider>
//   );

//   await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

//   const input = getByTestId('simulatorInput');
//   fireEvent.change(input, { target: { value: 'something' } });

//   await waitFor(() => {
//     fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
//   });

//   const responseData = { data: {} };
//   mockAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
//   await waitFor(() => {
//     expect(input).toHaveTextContent('');
//   });
// });

test('click on clear icon closes the simulator', async () => {
  defaultProps.showSimulator = true;
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...defaultProps} />
    </MockedProvider>
  );
  await waitFor(() => {
    fireEvent.click(getByTestId('clearIcon'));
  });
  expect(mockSetShowSimulator).toBeCalled();
});

const body = {
  id: '1',
  body: 'Hey there whats up?',
  insertedAt: '2020-06-25T13:36:43Z',
  location: null,
  messageNumber: 48,
  receiver: {
    id: '1',
  },
  sender: {
    id: '2',
  },
  tags: [
    {
      id: '1',
      label: 'important',
      colorCode: '#00d084',
    },
  ],
  type: 'TEXT',
  media: null,
  errors: '{}',
  contextMessage: {
    body: 'All good',
    contextId: 1,
    messageNumber: 10,
    errors: '{}',
    media: null,
    type: 'TEXT',
    insertedAt: '2021-04-26T06:13:03.832721Z',
    location: null,
    receiver: {
      id: '1',
    },
    sender: {
      id: '2',
      name: 'User',
    },
  },
};
const cache = new InMemoryCache({ addTypename: false });
export const searchQuery = {
  query: SEARCH_QUERY,
  variables: {
    filter: {},
    contactOpts: { limit: DEFAULT_CONTACT_LIMIT },
    messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [
      {
        group: null,
        contact: {
          id: '2',
          name: 'Effie Cormier',
          phone: '987654321',
          maskedPhone: '98****321',
          lastMessageAt: new Date(),
          status: 'VALID',
          bspStatus: 'SESSION_AND_HSM',
          isOrgRead: true,
        },
        messages: [body],
      },
    ],
  },
};

cache.writeQuery(searchQuery);
const client = new ApolloClient({
  cache: cache,
  assumeImmutableResults: true,
});

const HSMProps: any = {
  showSimulator: true,
  setShowSimulator: mockSetShowSimulator,
  setSimulatorId: mockSetShowSimulator,
  isPreviewMessage: true,
  simulatorIcon: false,
};

const HSMSimulator = (
  <ApolloProvider client={client}>
    <Simulator {...HSMProps} />
  </ApolloProvider>
);

test('simulator should open by default in preview HSM', async () => {
  const { getByTestId } = render(HSMSimulator);

  expect(getByTestId('beneficiaryName')).toBeInTheDocument();
});

test('simulator icon should not be seen in preview HSM', async () => {
  const { getByTestId } = render(HSMSimulator);
  expect(() => getByTestId('simulatorIcon')).toThrow();
});

test('simulator should render template message', () => {
  HSMProps.message = {
    type: 'TEXT',
    location: null,
    media: { caption: 'This is time for play. | [view contact, +917834811114]\n' },
    body: 'This is time for play. | [view contact, +917834811114]\n',
  };
  const { container } = render(
    <ApolloProvider client={client}>
      <Simulator {...HSMProps} />
    </ApolloProvider>
  );
});
