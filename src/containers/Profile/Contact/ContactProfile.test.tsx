import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { LOGGED_IN_USER_MOCK, getContactDetailsQuery, multiple_profile_mock } from 'mocks/Contact';
import { ContactProfile } from './ContactProfile';
import { mocks as historyMock } from './ContactHistory/ContactHistory.test';
import { MemoryRouter, Route, Routes } from 'react-router';

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

    expect(screen.getByText('Identities')).toBeInTheDocument();
    expect(screen.getByTestId('identity')).toHaveTextContent('WhatsApp919820198765');
  });
});

describe('contact profile details for a web-only contact', () => {
  const webOnlyDetails = getContactDetailsQuery('1', {
    activeProfile: null,
    phone: null,
    maskedPhone: null,
    identities: [{ id: '2', channel: 'WEB', identifier: 'ravi_web' }],
  });
  const mocks = [webOnlyDetails, webOnlyDetails, ...LOGGED_IN_USER_MOCK, ...historyMock];

  test('shows the web identity and no phone value', async () => {
    render(
      <MemoryRouter initialEntries={['/contact-profile/1']}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <Routes>
            <Route path="contact-profile/:id/*" element={<ContactProfile />} />
          </Routes>
        </MockedProvider>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText('Details'));

    await waitFor(() => {
      expect(screen.getByTestId('identity')).toHaveTextContent('Webravi_web');
    });
    expect(screen.getByTestId('phone')).toHaveTextContent(/^-$/);
  });
});

describe('contact profile details for a staff user', () => {
  const staffDetails = getContactDetailsQuery('1', { activeProfile: null, identities: [] });
  const mocks = [staffDetails, staffDetails, ...LOGGED_IN_USER_MOCK, ...historyMock];

  test('hides the identities block when the list is empty', async () => {
    render(
      <MemoryRouter initialEntries={['/contact-profile/1']}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <Routes>
            <Route path="contact-profile/:id/*" element={<ContactProfile />} />
          </Routes>
        </MockedProvider>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText('Details'));

    await waitFor(() => {
      expect(screen.getByText('Collections')).toBeInTheDocument();
    });
    expect(screen.queryByText('Identities')).not.toBeInTheDocument();
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

    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('profile name 1');
    });

    fireEvent.click(screen.getAllByTestId('profileHeader')[1]);

    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('profile name 2');
    });
  });

  test('should only show active profiles and shows correct status cues', async () => {
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByText('Contact Profile')).toBeInTheDocument();
    });

    const profileHeaders = await screen.findAllByTestId('profileHeader');

    expect(profileHeaders).toHaveLength(2);

    expect(profileHeaders[0]).toHaveTextContent('profile name 1DEFAULTCURRENT');
    expect(profileHeaders[1]).toHaveTextContent('profile name 2');
  });
});
