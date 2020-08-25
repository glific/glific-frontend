import React from 'react';
import { MenuItem as MenuItemElement } from '@material-ui/core';
import { Link } from 'react-router-dom';
import styles from './MenuItem.module.css';

export interface MenuItemProps {
  title: string;
  path: string;
  onClickHandler: any;
  className?: string;
}

const MenuItem: React.SFC<MenuItemProps> = (props) => {
  let menuItemClass = '';
  if (props.className === 'Danger') {
    menuItemClass = styles.Danger;
  }

  return (
    <MenuItemElement
      onClick={props.onClickHandler}
      component={Link}
      to={props.path}
      data-testid="MenuItem"
    >
      <div className={menuItemClass}>{props.title}</div>
    </MenuItemElement>
  );
};

export default MenuItem;
