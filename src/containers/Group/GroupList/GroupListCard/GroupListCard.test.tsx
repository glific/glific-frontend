import React from 'react';
import { shallow } from 'enzyme';
import { GroupListCard } from './GroupListCard';

const defaultProps = {
  data: [
    {
      id: '1',
      label: 'Staff Management Group',
      description: 'All staff members of the organization',
      operations: null,
    },
  ],
};

const card = <GroupListCard {...defaultProps} />;

test('it should have correct label', () => {
  const wrapper = shallow(card);
  expect(wrapper.find('div[data-testid="label"]').text()).toBe('Staff Management Group');
});

test('it should have correct description', () => {
  const wrapper = shallow(card);
  expect(wrapper.find('[data-testid="description"]').text()).toBe(
    'All staff members of the organization'
  );
});
