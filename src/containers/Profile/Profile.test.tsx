import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { LOGGED_IN_USER_MOCK } from 'mocks/Contact';
import { Profile } from './Profile';

const mocks = LOGGED_IN_USER_MOCK;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Profile match={{ params: { id: 1 } }} profileType="User" redirectionLink="/chat" />
  </MockedProvider>
);

it('should render Profile page', () => {
  const { container } = render(wrapper);
  expect(container).toBeInTheDocument();
});
