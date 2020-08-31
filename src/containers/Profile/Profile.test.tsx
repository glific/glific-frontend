import React from 'react';
import { shallow } from 'enzyme';
import { Profile } from './Profile';
import { LOGGED_IN_USER_MOCK } from './Profile.test.helper';
import { MockedProvider } from '@apollo/client/testing';

const mocks = LOGGED_IN_USER_MOCK;

const wrapper = shallow(
  <MockedProvider mocks={mocks} addTypename={false}>
    <Profile match={{ params: { id: 1 } }} profileType="User" redirectionLink="/chat" />
  </MockedProvider>
);

it('should render Profile page', () => {
  expect(wrapper.exists()).toBe(true);
});
