import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor, fireEvent } from '@testing-library/react';
import SavedSearchToolbar from './SavedSearchToolbar';
import { savedSearchQuery } from '../../../mocks/Chat';

const mocks = [savedSearchQuery];

describe('testing <SavedSearchToolbar />', () => {
  const defaultProps = {
    savedSearchCriteriaCallback: jest.fn,
    refetchData: { savedSearchCollection: null },
    onSelect: jest.fn,
  };

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
