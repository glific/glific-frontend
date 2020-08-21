import React from 'react';
import { shallow } from 'enzyme';
import { GroupContactList } from './GroupContactList';
import { GET_GROUP } from '../../../graphql/queries/Group';
import { MockedProvider } from '@apollo/client/testing';

const mocks = [
  {
    request: {
      query: GET_GROUP,
      variables: {
        id: 1,
      },
    },
    result: {
      data: {
        groups: [
          {
            id: 1,
            label: 'Staff Group',
          },
        ],
      },
    },
  },
];

const wrapper = shallow(
  <MockedProvider mocks={mocks} addTypename={false}>
    <GroupContactList match={{ params: { id: 1 } }} />
  </MockedProvider>
);

it('should render GroupContactList', () => {
  expect(wrapper.exists()).toBe(true);
});
