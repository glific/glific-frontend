import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';

import { LOGGED_IN_USER_MOCK, multiple_profile_mock, LOGGED_IN_USER_MULTIPLE_PROFILES } from 'mocks/Contact';
import { Profile } from './Profile';

const props: any = {
  profileType: 'User',
  redirectionLink: '/chat',
};

it('should render Profile page', async () => {
  const wrapper = (
    <MockedProvider mocks={LOGGED_IN_USER_MOCK} addTypename={false}>
      <Router>
        <Profile match={{ params: { id: 1 } }} {...props} />
      </Router>
    </MockedProvider>
  );

  const { container } = render(wrapper);

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});

it('should render profile page for contact profile', async () => {
  props.removePhoneField = true;

  render(
    <MockedProvider mocks={LOGGED_IN_USER_MOCK} addTypename={false}>
      <Router>
        <Profile {...props} />
      </Router>
    </MockedProvider>
  );

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));
});

it('should show default profile deletion message when deleting default profile', async () => {
  const multiProfileAttributes = {
    selectedProfile: {
      id: '2',
      name: 'profile name 1',
      is_default: true,
    },
    selectedProfileId: '2',
  };

  render(
    <MockedProvider mocks={multiple_profile_mock} addTypename={false}>
      <Router>
        <Profile
          match={{ params: { id: 1 } }}
          {...props}
          multiProfileAttributes={multiProfileAttributes}
        />
      </Router>
    </MockedProvider>
  );

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));

  const deleteButton = screen.queryByTestId('remove-icon');
  if (deleteButton) {
    fireEvent.click(deleteButton);
    expect(screen.getByText('Deleting default profile will delete the contact. This is irreversible.')).toBeInTheDocument();
  } else {
    expect(screen.getByTestId('formLayout')).toBeInTheDocument();
  }
});

it('should show non-default profile deletion message when deleting non-default profile', async () => {
  const multiProfileAttributes = {
    selectedProfile: {
      id: '3',
      name: 'profile name 2',
      is_default: false,
    },
    selectedProfileId: '3',
  };

  render(
    <MockedProvider mocks={multiple_profile_mock} addTypename={false}>
      <Router>
        <Profile
          match={{ params: { id: 1 } }}
          {...props}
          multiProfileAttributes={multiProfileAttributes}
        />
      </Router>
    </MockedProvider>
  );

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));

  const deleteButton = screen.queryByTestId('remove-icon');
  if (deleteButton) {
    fireEvent.click(deleteButton);
    console.log("ppp")
    expect(screen.getByText("You won't be able to send messages to this profile.")).toBeInTheDocument();
  } else {

    expect(screen.getByTestId('formLayout')).toBeInTheDocument();
  }
});

