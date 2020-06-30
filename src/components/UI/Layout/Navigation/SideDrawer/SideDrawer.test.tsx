import React from 'react';
import { Drawer, ListItem } from '@material-ui/core';

import { BrowserRouter as Router } from 'react-router-dom';
import SideMenus from '../SideMenus/SideMenus';
import SideDrawer from './SideDrawer';
import { sideDrawerMenus } from '../../../../../config/menu';

import { shallow, mount } from 'enzyme';

describe('side drawer testing', () => {
  let isToggled = false;
  const mockCallBack = jest.fn();
  const changeToggle = () => {
    console.log('being called');
    isToggled = !isToggled;
  };
  const component = (
    <Router>
      <SideDrawer />
    </Router>
  );

  it('it should be initialized properly', () => {
    const wrapper = mount(component);
    expect(wrapper).toBeTruthy();
    // Use Hidden at index 0 because there's two Drawer components.
    expect(wrapper.find(Drawer).at(0).find(ListItem).length).toEqual(sideDrawerMenus.length);
  });

  it('callback is working', () => {
    const wrapper = mount(component);
    let callBackObj = wrapper.find(Drawer).filterWhere((obj) => !!obj.props().onClose);
    callBackObj.simulate('close');
    callBackObj.invoke('onClose');
  });

  it('correct menu items rendered', () => {
    const wrapper = mount(component);
    // Find drawer that has the onClose prop
    let correctDrawer = wrapper.find(Drawer).filterWhere((n) => !!n.props().onClose);
    let menuItems = correctDrawer.find(ListItem);
    for (let i = 0; i < menuItems.length; i++) {
      expect(menuItems.at(i).text()).toEqual(sideDrawerMenus[i].title);
    }
  });
});
