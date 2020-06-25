import React from 'react';
import { NavLink } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText, List } from '@material-ui/core';

import { sideDrawerMenus } from '../../../../../config/menu';
import ListIcon from '../../../ListIcon/ListIcon';

export interface SideMenusProps {}

const SideMenus: React.SFC<SideMenusProps> = () => {
  const menuList = sideDrawerMenus.map((menu) => {
    return (
      <ListItem button key={menu.icon} component={NavLink} to={menu.path}>
        <ListItemIcon>
          <ListIcon icon={menu.icon} />
        </ListItemIcon>
        <ListItemText primary={menu.title} />
      </ListItem>
    );
  });

  return <List>{menuList}</List>;
};

export default SideMenus;
