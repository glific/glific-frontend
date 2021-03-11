import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SavedSearches from './SavedSearches';
import { MockedProvider } from '@apollo/client/testing';
import { savedSearchQuery } from '../../../mocks/Chat';
import { setUserSession } from '../../../services/AuthService';

describe('<SavedSearches />', () => {
  test('it should mount', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[savedSearchQuery]}>
        <SavedSearches />
      </MockedProvider>
    );
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      const savedSearches = screen.getByTestId('SavedSearches');

      expect(savedSearches).toBeInTheDocument();
    });
  });
});
