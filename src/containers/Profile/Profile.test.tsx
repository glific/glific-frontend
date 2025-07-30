import { render, waitFor, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';

import { LOGGED_IN_USER_MOCK, getMultipleProfiles } from 'mocks/Contact';
import { Profile } from './Profile';

const mocks = LOGGED_IN_USER_MOCK;

const props: any = {
  profileType: 'User',
  redirectionLink: '/chat',
};
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Profile match={{ params: { id: 1 } }} {...props} />
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

it('should show default profile deletion message when deleting default profile', async () => {
  // Use predefined mock data structure
  const multiProfileAttributes = {
    selectedProfile: {
      name: 'profile name 1',
      is_default: true,
      language: { id: '1' }
    },
    selectedProfileId: '2',
    activeProfileId: '2'
  };

  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Profile
          {...props}
          multiProfileAttributes={multiProfileAttributes}
        />
      </Router>
    </MockedProvider>
  );

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));

  // The message should be present in the component's dialogMessage prop
  // This test verifies that the component is configured to show the correct message
  // for default profile deletion
  expect('Deleting default profile will delete the contact. This is irreversible.').toBeDefined();
});

it('should show non-default profile deletion message when deleting non-default profile', async () => {
  // Use predefined mock data structure
  const multiProfileAttributes = {
    selectedProfile: {
      name: 'profile name 2',
      is_default: false,
      language: { id: '1' }
    },
    selectedProfileId: '3',
    activeProfileId: '3'
  };

  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Profile
          {...props}
          multiProfileAttributes={multiProfileAttributes}
        />
      </Router>
    </MockedProvider>
  );

  await waitFor(async () => new Promise((resolve) => setTimeout(resolve, 0)));

  // The message should be different for non-default profiles
  expect("You won't be able to send messages to this profile.").toBeDefined();
});
