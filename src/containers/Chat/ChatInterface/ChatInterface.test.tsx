import { MemoryRouter } from 'react-router-dom';
import { cleanup, render } from '@testing-library/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

import { setUserSession } from 'services/AuthService';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import { DEFAULT_CONTACT_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';

import { ChatInterface } from './ChatInterface';

const cache = new InMemoryCache({ addTypename: false });
cache.writeQuery({
  query: SEARCH_QUERY,
  variables: {
    contactOpts: { limit: DEFAULT_CONTACT_LIMIT },
    filter: {},
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
          lastMessageAt: '2020-06-29T09:31:47Z',
          status: 'VALID',
          fields: '{}',
          bspStatus: 'SESSION_AND_HSM',
          isOrgRead: true,
        },
        messages: [
          {
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
            interactiveContent: '{}',
            sendBy: 'test',
            flowLabel: null,
          },
        ],
      },
    ],
  },
});

const client = new ApolloClient({
  cache: cache,
  assumeImmutableResults: true,
});

window.HTMLElement.prototype.scrollIntoView = function () {};

afterEach(cleanup);

const wrapper = (
  <ApolloProvider client={client}>
    <MemoryRouter>
      <ChatInterface />
    </MemoryRouter>
  </ApolloProvider>
);

// set user session
setUserSession(JSON.stringify({ organization: { id: '1' } }));

describe('<ChatInterface />', () => {
  test('it should render <ChatInterface /> component correctly', async () => {
    const { getByText, findByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    // check if chat conversations are displayed
    const ChatConversation = await findByTestId('beneficiaryName');
    expect(ChatConversation).toHaveTextContent('Effie Cormier');

    // check if tags are displayed in the ChatMessages
    /**
     * commenting tags for now
     */
    // const ConversationTag = await findAllByText('important');
    // expect(ConversationTag[0]).toBeInTheDocument();
  });

  test('check condition when no subscription data provided', async () => {
    const { getByText, findByTestId } = render(wrapper);

    expect(getByText('Loading...')).toBeInTheDocument();

    const ChatConversation = await findByTestId('beneficiaryName');
    expect(ChatConversation).toHaveTextContent('Effie Cormier');
  });
});

// need to add mock for this

// test('it should render <Chat-collection/> component correctly', async () => {
//   const wrapper = (
//     <MemoryRouter>
//       <MockedProvider mocks={[...CONVERSATION_MOCKS, ...mocksWithConversation]}>
//         <Chat collectionId={2} />
//       </MockedProvider>
//     </MemoryRouter>
//   );
//   const { getByText } = render(wrapper);

//   // loading is show initially
//   expect(getByText('Loading...')).toBeInTheDocument();
//   // check if chat conversations are displayed

//   // await waitFor(() => {});
//   // await waitFor(() => {});
// });
