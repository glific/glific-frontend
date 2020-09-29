import React from 'react';
import { Drawer, ListItem } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import { mount } from 'enzyme';
import { wait } from '@testing-library/react';

import SideDrawer from './SideDrawer';
import { sideDrawerMenus } from '../../../../../config/menu';
import { getRoleBasedAccess } from '../../../../../context/role';
import { getCurrentUserQuery } from '../../../../../mocks/User';

const mocks = [getCurrentUserQuery];

describe('side drawer testing', () => {
  let isToggled = false;
  const mockCallBack = jest.fn();
  const changeToggle = () => {
    console.log('being called');
    isToggled = !isToggled;
  };
  const component = (
    <MockedProvider mocks={mocks}>
      <Router>
        <SideDrawer />
      </Router>
    </MockedProvider>
  );

  it('it should be initialized properly', async () => {
    const wrapper = mount(component);
    await wait();
    expect(wrapper).toBeTruthy();
    // Use Hidden at index 0 because there's two Drawer components.
    expect(wrapper.find(Drawer).at(0).find(ListItem).length).toEqual(getRoleBasedAccess().length);
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
