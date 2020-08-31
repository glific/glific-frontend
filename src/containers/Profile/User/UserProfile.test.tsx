import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { UserProfile } from './UserProfile';
import { LOGGED_IN_USER_MOCK } from '../Profile.test.helper';

const mocks = LOGGED_IN_USER_MOCK;

describe('<UserProfile />', () => {
  test('it should mount', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <UserProfile />
      </MockedProvider>
    );

    const userProfile = screen.getByTestId('UserProfile');

    expect(userProfile).toBeInTheDocument();
  });
});
