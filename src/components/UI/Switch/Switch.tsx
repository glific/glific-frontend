import { Switch as SwitchElement } from '@mui/material';
import styles from './Switch.module.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  testId?: string;
}

export const Switch = ({ checked, onChange, disabled = false, ariaLabel, testId }: SwitchProps) => (
  <SwitchElement
    checked={checked}
    onChange={(event) => onChange(event.target.checked)}
    disabled={disabled}
    disableRipple
    classes={{
      root: styles.Root,
      switchBase: styles.SwitchBase,
      thumb: styles.Thumb,
      track: styles.Track,
      checked: styles.Checked,
      disabled: styles.Disabled,
    }}
    slotProps={{
      input: { 'aria-label': ariaLabel, 'data-testid': testId } as React.InputHTMLAttributes<HTMLInputElement>,
    }}
  />
);

export default Switch;
