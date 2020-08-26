import React from 'react';

import { mount } from 'enzyme';
import { MockedProvider } from '@apollo/client/testing';
import ContactBar from './ContactBar';
import { wait } from '@testing-library/react';
import { contactGroupsQuery } from '../ChatMessage.test.helper';

const mocks = [contactGroupsQuery];

const defaultProps = {
  contactName: 'Jane Doe',
  contactId: '2',
};
const wrapper = mount(
  <MockedProvider mocks={mocks} addTypename={false}>
    <ContactBar {...defaultProps} />
  </MockedProvider>
);

test('it should render the name correctly', () => {
  expect(wrapper.find('h6[data-testid="beneficiaryName"]').text()).toEqual('Jane Doe');
});

test('it should render group names correctly', async () => {
  await wait();
  expect(wrapper.find('[data-testid="groupNames"]').text()).toEqual('Default Group, Staff Group');
});
