import React from 'react';
import { shallow } from 'enzyme';

import { Layout } from './Layout';
import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';

describe('layout testing', () => {
  it('renders the appropriate components', () => {
    const wrapper = shallow(<Layout />);
    expect(wrapper.find(SideDrawer).exists()).toBe(true);
  });
});
