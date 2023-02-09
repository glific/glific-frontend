import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { LOGGED_IN_USER_MOCK, LOGGED_IN_USER_MULTIPLE_PROFILES } from 'mocks/Contact';
import { ContactProfile } from './ContactProfile';
import { mocks as historyMock } from './ContactHistory/ContactHistory.test';
import { setOrganizationServices } from 'services/AuthService';

vi.mock('react-router-dom', () => {
  return {
    useParams: () => ({ id: '1' }),
  };
});

describe('contact profile', () => {
  const mocks = [...LOGGED_IN_USER_MOCK, ...historyMock];

  test('contact profile should render', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ContactProfile />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(getByTestId('ContactProfile')).toBeInTheDocument();
    });
  });

  test('contact should have a name or number', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ContactProfile />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(getByTestId('ContactProfile')).toBeInTheDocument();
    });
  });
});

describe('contact profile (multiple profile)', () => {
  setOrganizationServices('{"contactProfileEnabled":true}');
  const mocks = [...LOGGED_IN_USER_MULTIPLE_PROFILES, ...historyMock];

  test('contact profile should render', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ContactProfile />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(getByTestId('ContactProfile')).toBeInTheDocument();
    });
  });
});
