import React from 'react';
import { MenuItem as MenuItemElement } from '@material-ui/core';

export interface MenuItemProps {
  title: string;
  onClickHandler: any;
}

const MenuItem: React.SFC<MenuItemProps> = (props) => {
  return <MenuItemElement onClick={props.onClickHandler}>{props.title}</MenuItemElement>;
};

export default MenuItem;
