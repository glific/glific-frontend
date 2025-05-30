import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';

import { LOGGED_IN_USER_MOCK } from 'mocks/Contact';
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
