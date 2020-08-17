import React from 'react';
import { shallow } from 'enzyme';
import { Group } from './Group';
import { GET_GROUPS } from '../../graphql/queries/Group';
import { MockedProvider } from '@apollo/client/testing';

const mocks = [
  {
    request: {
      query: GET_GROUPS,
    },
    result: {
      data: [
        {
          groups: {
            label: 'Staff group',
            description: 'Only for staff members',
          },
        },
      ],
    },
  },
];

const wrapper = shallow(
  <MockedProvider mocks={mocks}>
    <Group match={{ params: { id: 1 } }} />
  </MockedProvider>
);

it('should render Group', () => {
  expect(wrapper.exists()).toBe(true);
});
