import { fireEvent, render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { LOGGED_IN_USER_MOCK, LOGGED_IN_USER_MULTIPLE_PROFILES } from 'mocks/Contact';
import { ContactProfile } from './ContactProfile';
import { mocks as historyMock } from './ContactHistory/ContactHistory.test';
import { setOrganizationServices } from 'services/AuthService';

jest.mock('react-router-dom', () => {
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

  /**
   * Now tags will be replaced by labels
   * commenting tag cases for now. we'll visit sometime later.
   */
  test('it renders contact profile and update tags', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ContactProfile />
      </MockedProvider>
    );

    // autocomplete.focus();
    // fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    // await waitFor(() => {});

    // // select the first item
    // fireEvent.keyDown(autocomplete, { key: 'Enter' });
    await waitFor(() => {});

    await waitFor(() => {
      const save = getByRole('button', { name: 'Save' });
      fireEvent.click(save);
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
