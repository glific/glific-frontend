import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText, List } from '@material-ui/core';

import { sideDrawerMenus } from '../../../../../config/menu';
import ListIcon from '../../../ListIcon/ListIcon';

export interface SideMenusProps {}

const SideMenus: React.SFC<SideMenusProps> = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuList = sideDrawerMenus.map((menu, i) => {
    return (
      <ListItem
        button
        selected={selectedIndex === i}
        key={menu.icon}
        component={NavLink}
        to={menu.path}
        onClick={() => setSelectedIndex(i)}
      >
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
