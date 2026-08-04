import { IconButton as IconButtonElement, IconButtonProps as MaterialIconButtonProps } from '@mui/material';

export interface IconButtonProps extends MaterialIconButtonProps {
  'data-testid'?: string;
}

export const IconButton = ({ children, ...rest }: IconButtonProps) => (
  <IconButtonElement {...rest}>{children}</IconButtonElement>
);

export default IconButton;
