import { BrowserRouter as Router } from 'react-router';
import { render, cleanup, waitFor, screen, fireEvent } from '@testing-library/react';

import { SEARCH_QUERY } from 'graphql/queries/Search';
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import CollectionConversations from './CollectionConversations';
import { MockedProvider } from '@apollo/client/testing';
import { searchCollectionsQuery } from 'mocks/Chat';

const searchQueryMock = {
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
      filter: { searchGroup: true },
      messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
    },
  },
  result: {
    data: {
      search: [
        {
          id: 'group_2',
          group: {
            id: '2',
            label: 'Default Collection',
          },
          contact: null,
          messages: [
            {
              id: '1',
              body: 'Hey there whats up?',
              insertedAt: '2020-06-25T13:36:43Z',
              messageNumber: 0,
              location: null,
              receiver: {
                id: '1',
              },
              sender: {
                id: '2',
              },
              type: 'TEXT',
              media: null,
              errors: null,
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
        {
          id: 'group_3',
          group: {
            id: '3',
            label: 'Optin Collection',
          },
          contact: null,
          messages: [],
        },
      ],
    },
  },
};

afterEach(cleanup);

const props = {
  searchVal: 'opt',
  searchMode: false,
  searchParam: {},
};

const collectionConversation = (
  <MockedProvider mocks={[searchQueryMock, searchCollectionsQuery]}>
    <Router>
      <CollectionConversations collectionId={3} {...props} />
    </Router>
  </MockedProvider>
);

describe('<CollectionConversation />', () => {
  test('it should render <CollectionConversations /> component correctly', async () => {
    const { container } = render(collectionConversation);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  test('It should render search bar and perform its actions', async () => {
    const { container, getByTestId } = render(collectionConversation);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('searchForm')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'optin' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getAllByRole('list')).toHaveLength(1);
      expect(screen.getByText('New optin')).toBeInTheDocument();
    });
  });
});
