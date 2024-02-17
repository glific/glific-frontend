import { MenuItem as MenuItemElement } from '@mui/material';
import { Link } from 'react-router-dom';

import styles from './MenuItem.module.css';

export interface MenuItemProps {
  title: string;
  path: string;
  icon?: any;
  onClickHandler: any;
  className?: string;
  spacing?: boolean;
}

const MenuItem = ({
  className,
  onClickHandler,
  path,
  icon,
  title,
  spacing = true,
}: MenuItemProps) => {
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
      <div className={`${className} ${icon && spacing ? styles.Spacing : ''}`}>{title}</div>
    </MenuItemElement>
  );
};

export default MenuItem;
