import React, { useState } from 'react';
import { Menu as MenuElement } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';

import MenuItem from './MenuItem/MenuItem';

export interface MenuProps {
  menus: any;
}

const Menu: React.SFC<MenuProps> = (props) => {
  const { menus, children } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuList = menus.map((menu: any) => (
    <div key={menu.title}>
      <MenuItem
        onClickHandler={() => {
          if (menu.onClick) {
            menu.onClick();
          }
          handleClose();
        }}
        {...menu}
      />
    </div>
  ));

  return (
    <div data-testid="Menu">
      <div onMouseEnter={handleClick} aria-hidden="true">
        {children}
      </div>
      <MenuElement
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {menuList}
      </MenuElement>
    </div>
  );
};

export default Menu;
