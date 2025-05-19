import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { LOGGED_IN_USER_MOCK, multiple_profile_mock } from 'mocks/Contact';
import { ContactProfile } from './ContactProfile';
import { mocks as historyMock } from './ContactHistory/ContactHistory.test';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('contact profile with single profile', () => {
  const mocks = [...LOGGED_IN_USER_MOCK, ...historyMock];

  const contactProfile = (
    <MemoryRouter initialEntries={['/contact-profile/1']}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <Routes>
          <Route path="contact-profile/:id/*" element={<ContactProfile />} />
        </Routes>
      </MockedProvider>
    </MemoryRouter>
  );

  test('contact profile should render', async () => {
    const { getByText, getAllByRole } = render(contactProfile);

    await waitFor(() => {
      expect(getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText('Provider status')).toBeInTheDocument();
    });

    // shows N/A when no name
    await waitFor(() => {
      expect(getAllByRole('textbox')[0]).toHaveValue('N/A');
    });

    fireEvent.click(getByText('History'));

    await waitFor(() => {
      expect(screen.getByText('Removed from collection: "Optout contacts"')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Details'));

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Collections')).toBeInTheDocument();
    });
  });
});

describe('contact profile with multiple profiles', () => {
  const wrapper = (
    <MockedProvider mocks={multiple_profile_mock}>
      <MemoryRouter initialEntries={['/contact-profile/2']}>
        <Routes>
          <Route path="contact-profile/:id/*" element={<ContactProfile />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

  test('should switch profile', async () => {
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByText('Contact Profile')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    //should show active profile first
    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('profile name 2');
    });

    fireEvent.click(screen.getAllByTestId('profileHeader')[1]);

    //should show active profile first
    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('profile name 1');
    });
  });
});
