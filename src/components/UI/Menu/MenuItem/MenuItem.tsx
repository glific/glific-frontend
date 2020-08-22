import React from 'react';
import { MenuItem as MenuItemElement } from '@material-ui/core';
import { Link } from 'react-router-dom';

export interface MenuItemProps {
  title: string;
  path: string;
  onClickHandler: any;
}

const MenuItem: React.SFC<MenuItemProps> = (props) => {
  return (
    <MenuItemElement
      onClick={props.onClickHandler}
      component={Link}
      to={props.path}
      data-testid="MenuItem"
    >
      {props.title}
    </MenuItemElement>
  );
};

export default MenuItem;
