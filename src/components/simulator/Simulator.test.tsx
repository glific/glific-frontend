import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { DEFAULT_CONTACT_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import axios from 'axios';
import { vi } from 'vitest';

import { SEARCH_QUERY } from 'graphql/queries/Search';
import { conversationQuery } from 'mocks/Chat';
import {
  messageReceivedSubscription,
  messageSendSubscription,
  simulatorGetQuery,
  simulatorReleaseQuery,
  simulatorReleaseSubscription,
  simulatorSearchQuery,
} from 'mocks/Simulator';
import { Simulator } from './Simulator';
import { setUserSession } from 'services/AuthService';

vi.mock('axios');
const mockedAxios = axios as any;

setUserSession(JSON.stringify({ roles: ['Admin'], organization: { id: '1' } }));
const mockSetShowSimulator = vi.fn();

const mocks = [
  conversationQuery,
  simulatorReleaseSubscription,
  simulatorReleaseQuery,
  simulatorSearchQuery,
  simulatorSearchQuery,
  messageReceivedSubscription,
  messageSendSubscription,
  simulatorGetQuery,
  simulatorGetQuery,
];
const getDefaultProps = () => ({
  showSimulator: false,
  setShowSimulator: mockSetShowSimulator,
  setSimulatorId: mockSetShowSimulator,
  isPreviewMessage: false,
  resetMessage: vi.fn(),
});

test('simulator should open on click of simulator icon', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...getDefaultProps()} />
    </MockedProvider>
  );
  // To open simulator
  const button = getByTestId('simulatorIcon');

  await waitFor(() => {
    fireEvent.click(button);

    expect(mockSetShowSimulator).toBeCalledTimes(1);
  });
});

test('opened simulator should close when click of simulator icon', async () => {
  const props = getDefaultProps();
  const mockOpenSimulator = vi.fn();
  props.showSimulator = true;
  props.setSimulatorId = mockOpenSimulator;
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...props} />
    </MockedProvider>
  );

  // To open simulator
  const button = getByTestId('simulatorIcon');

  await waitFor(() => {
    fireEvent.click(button);
    expect(mockSetShowSimulator).toHaveBeenCalledTimes(2);
  });
});

test('send a message/media from the simulator', async () => {
  const props = getDefaultProps();
  props.showSimulator = true;

  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...props} />
    </MockedProvider>
  );
  mockedAxios.post.mockImplementation(() => Promise.resolve({ data: {} }));

  const input = getByTestId('simulatorInput');
  fireEvent.change(input, { target: { value: 'something' } });

  await waitFor(() => {
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
  });

  await waitFor(() => {
    expect(input).toHaveTextContent('');
  });

  // Get attachment icon
  const attachmentIcon = screen.getByTestId('attachment');
  expect(attachmentIcon).toBeInTheDocument();

  fireEvent.click(attachmentIcon);
  await waitFor(() => {});

  const [imageButton] = screen.getAllByRole('button');
  expect(imageButton).toBeInTheDocument();

  fireEvent.click(imageButton);
  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));
});

test('click on clear icon closes the simulator', async () => {
  const props = getDefaultProps();
  props.showSimulator = true;
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...props} />
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
  interactiveContent: '{}',
  sendBy: 'test',
  flowLabel: null,
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
          fields: '{}',
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
  render(
    <ApolloProvider client={client}>
      <Simulator {...HSMProps} />
    </ApolloProvider>
  );
});

const getFlowKeywordMock = vi.fn();
const props = {
  showSimulator: true,
  setSimulatorId: vi.fn(),
  simulatorIcon: true,
  isPreviewMessage: false,
  flowSimulator: false,
  getFlowKeyword: getFlowKeywordMock,
  hasResetButton: true,
};

test('simulator should reset on clicking the reset button message', () => {
  const { getByTestId } = render(
    <MockedProvider mocks={mocks}>
      <Simulator {...props} />
    </MockedProvider>
  );

  const resetButton = getByTestId('resetIcon');
  fireEvent.click(resetButton);
  expect(getFlowKeywordMock).toBeCalled();
});
