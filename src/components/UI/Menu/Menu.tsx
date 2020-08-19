import React, { useState } from 'react';
import { Menu as MenuElement } from '@material-ui/core';
import MenuItem from './MenuItem/MenuItem';

export interface MenuProps {
  menus: any;
}

const Menu: React.SFC<MenuProps> = (props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuList = props.menus.map((menu: any) => {
    return <MenuItem onClickHandler={handleClose} title={menu.title} />;
  });

  return (
    <div data-testid="Menu">
      <div onClick={handleClick}>{props.children}</div>
      <MenuElement anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {menuList}
      </MenuElement>
    </div>
  );
};

export default Menu;
