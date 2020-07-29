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
      variables: { filter: {}, opts: { limit: 3 } },
    },
    result: {
      data: {
        savedSearches: [
          {
            id: '1',
            args:
              '{"term":"","messageOpts":{"limit":5},"filter":{"includeTags":["12"]},"contactOpts":{"limit":10}}',
            label: 'All unread conversations',
            shortcode: 'Unread',
            count: 10,
          },
        ],
      },
    },
  },
];

describe('testing <SavedSearchToolbar />', () => {
  const defaultProps = { savedSearchCriteriaCallback: jest.fn };

  test('it should render <SavedSearchToolbar /> component correctly', async () => {
    const { findByText, getByText, container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SavedSearchToolbar {...defaultProps} />
      </MockedProvider>
    );

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    // check if Unread Saved search is rendered
    const unreadButton = await findByText('Unread');
    expect(unreadButton).toBeInTheDocument();

    // simulate saves search is selected
    fireEvent.click(unreadButton);
    expect(container.querySelector('.ButtonSelected')).toBeInTheDocument();

    // simulate saves search is cleared
    fireEvent.click(unreadButton);
    expect(container.querySelector('.ButtonSelected')).toBeFalsy();
  });
});
