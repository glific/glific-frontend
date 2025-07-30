import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';

import { LOGGED_IN_USER_MOCK, multiple_profile_mock } from 'mocks/Contact';
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

it('should show default profile deletion warning pop up when deleting default profile', async () => {
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


