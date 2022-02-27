import React, { useState } from 'react';
import { Menu as MenuElement } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';

import MenuItem from './MenuItem/MenuItem';

export interface MenuProps {
  menus: any;
  eventType?: string | undefined;
}

const Menu: React.SFC<MenuProps> = ({ menus, children, eventType = 'Click' }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement> | undefined
  ) => {
    if (event) {
      setAnchorEl(event.currentTarget);
    }
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
      <div
        onClick={eventType === 'Click' ? handleClick : undefined}
        onKeyDown={eventType === 'Click' ? handleClick : undefined}
        onMouseEnter={eventType === 'MouseEnter' ? handleClick : undefined}
        aria-hidden="true"
      >
        {children}
      </div>
      <MenuElement
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <div onMouseLeave={eventType === 'MouseEnter' ? handleClose : undefined}>{menuList}</div>
      </MenuElement>
    </div>
  );
};

export default Menu;
