import 'mocks/matchMediaMock';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { LOGGED_IN_USER_MOCK } from 'mocks/Contact';
import { ContactProfile } from './ContactProfile';
import { mocks as historyMock } from './ContactHistory/ContactHistory.test';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual: any = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

describe('contact profile', () => {
  const mocks = [...LOGGED_IN_USER_MOCK, ...historyMock];

  const contactProfile = (
    <MemoryRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <ContactProfile />
      </MockedProvider>
    </MemoryRouter>
  );

  test('contact profile should render', async () => {
    const { getByText } = render(contactProfile);
    await waitFor(() => {
      expect(getByText('Profile')).toBeInTheDocument();
    });
  });
});
