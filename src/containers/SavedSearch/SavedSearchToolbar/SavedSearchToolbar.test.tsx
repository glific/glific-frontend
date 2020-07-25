import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';

import SavedSearchToolbar from './SavedSearchToolbar';
import { SAVED_SEARCH_QUERY } from '../../../graphql/queries/Search';

const mocks = [
  {
    request: {
      query: SAVED_SEARCH_QUERY,
      variables: { filter: {} },
    },
    result: {
      data: {
        savedSearches: [
          {
            args:
              '{"term":"","messageOpts":{"limit":5},"filter":{"includeTags":["12"]},"contactOpts":{"limit":10}}',
            id: '1',
            label: 'All unread conversations',
          },
        ],
      },
    },
  },
];

describe('testing <SavedSearchToolbar />', () => {
  const defaultProps = { savedSearchCriteriaCallback: jest.fn };

  test('it should render <SavedSearchToolbar /> component correctly', async () => {
    const { findAllByText, getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SavedSearchToolbar {...defaultProps} />
      </MockedProvider>
    );

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    // check if Unread Saved search is rendered
    const unreadButton = await findAllByText('Unread');
    expect(unreadButton).toHaveLength(1);

    //fireEvent.click(unreadButton);
  });
});
