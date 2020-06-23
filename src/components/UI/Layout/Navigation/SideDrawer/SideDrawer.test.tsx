import React from 'react';
import {
  Hidden,
  Drawer,
  makeStyles,
  createStyles,
  Theme,
  useTheme,
  Divider,
  Typography,
  ListItem,
} from '@material-ui/core';

import { BrowserRouter as Router } from 'react-router-dom';
import SideMenus from '../SideMenus/SideMenus';
import * as constants from '../../../../../common/constants';
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
      <SideDrawer MenuToggle={changeToggle} isMobile={isToggled} />
    </Router>
  );

  it('initialized properly', () => {
    const wrapper = mount(component);
    expect(wrapper).toBeTruthy();
    // Use Hidden at index 0 because there's two Drawer components.
    expect(wrapper.find(Drawer).at(0).find(ListItem).length).toEqual(sideDrawerMenus.length);
  });

  it('callback is working', () => {
    const wrapper = mount(component);
    // console.log(wrapper.debug());
    console.log(isToggled);
    console.log(
      wrapper
        .find(Drawer)
        .findWhere((obj) => !!obj.props().onClose === true)
        .at(0)
        .props()
    );
    console.log(isToggled);
    // expect(isToggled).toBe(true);
  });

  // constants number appear with the same tests (in the same order).
  // for (let i = 0; i < 4; i++) {
  // console.log(wrapper.find(Typography).at(i).text());
  // }
  // expect(wrapper).toHaveBeenCalled();
});
