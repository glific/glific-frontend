import { fireEvent, render, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import { conversationMessageQuery, savedSearchQuery, savedSearchQueryError } from 'mocks/Chat';
import { setUserSession } from 'services/AuthService';
import SavedSearches from './SavedSearches';
import { MemoryRouter } from 'react-router';

const searchQueryMock = conversationMessageQuery(
  { includeLabels: ['12'] },
  'Jane Doe',
  '919090909009',
  1,
  {
    limit: 1,
  },
);

const SavedSearch = (
  <MemoryRouter>
    <MockedProvider mocks={[savedSearchQuery, searchQueryMock]}>
      <SavedSearches />
    </MockedProvider>
  </MemoryRouter>
);

describe('<SavedSearches />', () => {
  test('it should mount', async () => {
    const { getByText, getByTestId } = render(SavedSearch);
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      const savedSearches = getByTestId('SavedSearches');

      expect(savedSearches).toBeInTheDocument();
    });
  });

  test.only('click on search input', async () => {
    const { getByTestId, getByText } = render(SavedSearch);

    await waitFor(() => {
      const input = getByTestId('AutocompleteInput');
      fireEvent.click(input);
    });

    await waitFor(() => {
      const selectOption = getByText('test');
      fireEvent.click(selectOption);
    });
  });

  test('type on search input', async () => {
    const { container, getByTestId } = render(SavedSearch);

    await waitFor(() => {
      const autocompleteInput = getByTestId('AutocompleteInput');
      fireEvent.click(autocompleteInput);
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      UserEvent.type(input, 'hi');
    });
  });

  test('check if savedSearch query return error', async () => {
    const SavedSearch = (
      <MockedProvider mocks={[savedSearchQueryError]}>
        <SavedSearches />
      </MockedProvider>
    );
    const { getByText } = render(SavedSearch);

    await waitFor(() => {
      getByText('No options available');
    });
  });
});
