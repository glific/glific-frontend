import React from 'react';
import { Button as ButtonElement } from '@material-ui/core';
import styles from './Button.module.css';

export interface ButtonProps {
  children: any;
  variant: any;
  color: any;
  onClick?: any;
  className?: any;
}

export const Button: React.SFC<ButtonProps> = (props) => {
  return (
    <ButtonElement
      variant={props.variant}
      color={props.color}
      onClick={props.onClick}
      className={`${styles.Button} ${props.className}`}
    >
      {props.children}
    </ButtonElement>
  );
};
