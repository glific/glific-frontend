import React from 'react';
import { Button as ButtonElement, CircularProgress } from '@material-ui/core';
import styles from './Button.module.css';

export interface ButtonProps {
  'data-testid'?: string;
  children: any;
  variant: 'text' | 'outlined' | 'contained' | undefined;
  color: 'inherit' | 'primary' | 'secondary' | 'default' | undefined;
  onClick?: any;
  className?: any;
  loading?: boolean;
  disabled?: boolean;
  type?: any;
}

export const Button = ({
  type = 'button',
  loading = false,
  disabled = false,
  ...props
}: ButtonProps) => {
  let buttonColor = null;
  const { variant, color, onClick, className, children, ...rest } = props;

  if (variant === 'outlined') buttonColor = styles.ButtonColor;

  return (
    <ButtonElement
      variant={variant}
      color={color}
      onClick={onClick}
      data-testid={rest['data-testid']}
      className={`${styles.Button} ${className} ${buttonColor}`}
      disabled={loading || disabled}
      type={type}
    >
      {children}
      {loading && <CircularProgress size={28} className={styles.buttonProgress} />}
    </ButtonElement>
  );
};
