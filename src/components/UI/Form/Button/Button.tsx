import {
  Button as ButtonElement,
  CircularProgress,
  ButtonProps as MaterialButtonProps,
} from '@mui/material';
import styles from './Button.module.css';

export interface ButtonProps extends MaterialButtonProps {
  'data-testid'?: string;
  children: any;
  className?: any;
  loading?: boolean;
  type?: any;
}

export const Button = ({
  type = 'button',
  loading = false,
  disabled = false,
  ...props
}: ButtonProps) => {
  let buttonColor;
  const { variant, color, onClick, className, children, ...rest } = props;

  // if (variant === 'outlined') buttonColor = styles.ButtonColor;

  return (
    <ButtonElement
      {...rest}
      variant={variant}
      color={color}
      onClick={onClick}
      className={`${styles.Button} ${className} ${buttonColor}`}
      disabled={loading || disabled}
      type={type}
    >
      {children}
      {loading && <CircularProgress size={28} className={styles.buttonProgress} />}
    </ButtonElement>
  );
};
