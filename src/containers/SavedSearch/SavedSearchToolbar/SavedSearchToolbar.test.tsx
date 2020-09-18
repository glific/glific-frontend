import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, wait, act, fireEvent } from '@testing-library/react';
import SavedSearchToolbar from './SavedSearchToolbar';
import { savedSearchQuery } from '../../../mocks/Chat';

const mocks = [savedSearchQuery];

describe('testing <SavedSearchToolbar />', () => {
  const defaultProps = {
    savedSearchCriteriaCallback: jest.fn,
    refetchData: { savedSearchCollection: null },
  };

  test('it should render <SavedSearchToolbar /> component correctly', async () => {
    const { findByText, getByText, container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SavedSearchToolbar {...defaultProps} />
      </MockedProvider>
    );

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await wait();

    // check if Unread Saved search is rendered
    const unreadButton = await findByText('Unread');
    expect(unreadButton).toBeInTheDocument();

    // simulate saves search is selected
    act(() => {
      fireEvent.click(unreadButton);
    });

    expect(container.querySelector('.SavedSearchItemSelected')).toBeInTheDocument();
  });
});
