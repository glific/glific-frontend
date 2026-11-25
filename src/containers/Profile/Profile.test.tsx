import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';
import { vi } from 'vitest';

import {
  LOGGED_IN_USER_MOCK,
  getContactSampleQuery,
  multiple_profile_mock as MULTIPLE_PROFILE_MOCK,
} from 'mocks/Contact';
import { getUsersEmptyVars2, getUsersEmptyVars } from 'mocks/User';
import { Profile } from './Profile';

vi.mock('react-router', async (importOriginal) => {
  const actual: unknown = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useParams: () => ({ id: '14' }),
  };
});

const mocks = [...LOGGED_IN_USER_MOCK, getUsersEmptyVars];

const props: any = {
  profileType: 'User',
  redirectionLink: '/chat',
  channels: [{ channel: 'WHATSAPP', active: true }],
};

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Profile {...props} />
    </Router>
  </MockedProvider>
);

it('should render Profile page', async () => {
  const { container } = render(wrapper);

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});

it('should render profile page for contact profile', async () => {
  props.removePhoneField = true;

  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Profile {...props} />
      </Router>
    </MockedProvider>
  );

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));
});

it('should show default profile deletion warning pop up when deleting default profile', async () => {
  const multiProfileAttributes = {
    selectedProfile: {
      id: '2',
      name: 'profile name 1',
      is_default: true,
    },
    selectedProfileId: '2',
  };

  const mocks2 = [...MULTIPLE_PROFILE_MOCK, getUsersEmptyVars2];

  render(
    <MockedProvider mocks={mocks2} addTypename={false}>
      <Router>
        <Profile {...props} multiProfileAttributes={multiProfileAttributes} />
      </Router>
    </MockedProvider>
  );

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));

  const deleteButton = screen.queryByTestId('remove-icon');
  if (deleteButton) {
    fireEvent.click(deleteButton);
    expect(
      screen.getByText('Deleting default profile will delete the contact. This is irreversible.')
    ).toBeInTheDocument();
  } else {
    expect(screen.getByTestId('formLayout')).toBeInTheDocument();
  }
});

it('should show staff account linked to this contact will also get deleted warning pop up when deleting profile', async () => {
  const multiProfileAttributes = {
    selectedProfile: {
      id: '3',
      name: 'profile name 2',
      is_default: false,
    },
    selectedProfileId: '3',
  };
  const mocks3 = [...MULTIPLE_PROFILE_MOCK, getUsersEmptyVars];
  render(
    <MockedProvider mocks={mocks3} addTypename={false}>
      <Router>
        <Profile {...props} multiProfileAttributes={multiProfileAttributes} />
      </Router>
    </MockedProvider>
  );
  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  const deleteButton = screen.queryByTestId('remove-icon');

  if (deleteButton) {
    fireEvent.click(deleteButton);
  }
  expect(
    screen.getByText(
      "You won't be able to send messages to this profile. Staff account linked to this contact will also get deleted."
    )
  ).toBeInTheDocument();
});

it('should show only profile deletion warning pop up when deleting  profile', async () => {
  const multiProfileAttributes = {
    selectedProfile: {
      id: '3',
      name: 'profile name 2',
      is_default: false,
    },
    selectedProfileId: '3',
  };
  const mocks4 = [...MULTIPLE_PROFILE_MOCK, getUsersEmptyVars2];
  render(
    <MockedProvider mocks={mocks4} addTypename={false}>
      <Router>
        <Profile {...props} multiProfileAttributes={multiProfileAttributes} />
      </Router>
    </MockedProvider>
  );
  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  const deleteButton = screen.queryByTestId('remove-icon');
  if (deleteButton) {
    fireEvent.click(deleteButton);
  }
  expect(screen.getByText("You won't be able to send messages to this profile.")).toBeInTheDocument();
});

describe('on the contact profile, with channels', () => {
  const renderWithChannels = (channels: any[]) =>
    render(
      <MockedProvider mocks={[...mocks, getContactSampleQuery({ id: '14' })]} addTypename={false}>
        <Router>
          <Profile {...props} removePhoneField channels={channels} />
        </Router>
      </MockedProvider>
    );

  it('shows contact details with each channel, and a read-only WhatsApp card', async () => {
    renderWithChannels([
      { channel: 'WHATSAPP', active: true },
      { channel: 'WEB', active: false },
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('contactDetails')).toBeInTheDocument();
    });

    expect(screen.getByText('Shared across all channels.')).toBeInTheDocument();
    expect(await screen.findAllByTestId('channelRow')).toHaveLength(2);
    expect(screen.getByTestId('whatsAppStatus')).toHaveTextContent(/^VALID$/);
    expect(screen.getByTestId('whatsAppProviderStatus')).toHaveTextContent(/^SESSION_AND_HSM$/);
    expect(screen.queryByText('Provider status', { selector: 'h5' })).not.toBeInTheDocument();
  });

  it('has no WhatsApp card when WhatsApp is not active', async () => {
    renderWithChannels([
      { channel: 'WHATSAPP', active: false },
      { channel: 'WEB', active: true },
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('contactDetails')).toBeInTheDocument();
    });

    expect(await screen.findAllByTestId('channelRow')).toHaveLength(2);
    expect(screen.queryByTestId('whatsAppDetails')).not.toBeInTheDocument();
  });
});
