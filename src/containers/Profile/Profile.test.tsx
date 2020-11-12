import React from 'react';
import { render } from '@testing-library/react';
import { Profile } from './Profile';
import { LOGGED_IN_USER_MOCK } from '../../mocks/Contact';
import { MockedProvider } from '@apollo/client/testing';

const mocks = LOGGED_IN_USER_MOCK;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Profile match={{ params: { id: 1 } }} profileType="User" redirectionLink="/chat" />
  </MockedProvider>
);

it('should render Profile page', () => {
  const {container}= render(wrapper)
  expect(container).toBeInTheDocument();
});
