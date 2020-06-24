import React from 'react';
import { Button as ButtonElement } from '@material-ui/core';

export interface ButtonProps {
  children: string;
  variant: any;
  color: any;
  onClick: any;
}

export const Button: React.SFC<ButtonProps> = (props) => {
  return (
    <ButtonElement variant={props.variant} color={props.color} onClick={props.onClick}>
      {props.children}
    </ButtonElement>
  );
};
