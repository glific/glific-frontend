import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { LOGGED_IN_USER_MOCK } from 'mocks/Contact';
import { UserProfile } from './UserProfile';

const mocks = LOGGED_IN_USER_MOCK;

const defaultProps = {
  match: { params: { id: 1 } },
  profileType: 'User',
  redirectionLink: '/chat',
};

describe('<UserProfile />', () => {
  test('it should render', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <UserProfile {...defaultProps} />
      </MockedProvider>
    );

    const userProfile = screen.getByTestId('UserProfile');

    expect(userProfile).toBeInTheDocument();
  });
});
