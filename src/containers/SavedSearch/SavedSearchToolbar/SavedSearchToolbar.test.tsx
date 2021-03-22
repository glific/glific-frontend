import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor, fireEvent } from '@testing-library/react';
import SavedSearchToolbar from './SavedSearchToolbar';
import { collectionCountQuery, savedSearchStatusQuery } from '../../../mocks/Chat';
import { collectionCountSubscription } from '../../../mocks/Search';
import { setUserSession } from '../../../services/AuthService';

const mocks = [savedSearchStatusQuery, collectionCountSubscription, collectionCountQuery];

describe('testing <SavedSearchToolbar />', () => {
  const defaultProps = {
    savedSearchCriteriaCallback: jest.fn,
    refetchData: { savedSearchCollection: null },
    onSelect: jest.fn,
  };

  setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

  test('it should render <SavedSearchToolbar /> component correctly', async () => {
    const { getByText, container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SavedSearchToolbar {...defaultProps} />
      </MockedProvider>
    );

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      // check if Unread Saved search is rendered
      const unreadButton: any = getByText('Unread');
      expect(unreadButton).toBeInTheDocument();

      // simulate saves search is selected
      fireEvent.click(unreadButton);
    });

    expect(container.querySelector('.SavedSearchItemSelected')).toBeInTheDocument();
  });
});
