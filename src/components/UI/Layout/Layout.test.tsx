import React from 'react';
import { shallow } from 'enzyme';
import { Layout } from './Layout';
import { Header } from './Header/Header';
import { Content } from './Content/Content';
import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';

describe('layout testing', () => {
  it('renders the appropriate components', () => {
    const wrapper = shallow(<Layout />);
    expect(wrapper.find(Header).exists()).toBe(true);
    expect(wrapper.find(SideDrawer).exists()).toBe(true);
    expect(wrapper.find(Content).exists()).toBe(true);
  });
});
