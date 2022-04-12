import React from 'react';
import { MenuItem as MenuItemElement } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from './MenuItem.module.css';

export interface MenuItemProps {
  title: string;
  path: string;
  icon?: any;
  onClickHandler: any;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ className, onClickHandler, path, icon, title }) => {
  const { t } = useTranslation();

  let menuItemClass = '';
  if (className === 'Danger') {
    menuItemClass = styles.Danger;
  }

  let link = {};
  // check if we have a path to another page and add Link component
  if (path) {
    link = {
      component: Link,
      to: path,
    };
  }

  return (
    <MenuItemElement onClick={onClickHandler} {...link} data-testid="MenuItem">
      {icon}
      <div className={`${menuItemClass} ${icon ? styles.Spacing : ''}`}>{t(title)}</div>
    </MenuItemElement>
  );
};

export default MenuItem;
