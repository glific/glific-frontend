import React from 'react';
import { shallow } from 'enzyme';
import { GroupContactList } from './GroupContactList';

const wrapper = shallow(<GroupContactList match={{ params: { id: 1 } }} title={'Default Group'} />);

it('should render GroupContactList', () => {
  expect(wrapper.exists()).toBe(true);
});
