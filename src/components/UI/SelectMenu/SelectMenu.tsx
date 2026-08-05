import { Menu, MenuItem } from '@mui/material';
import { ReactNode, useState } from 'react';
import styles from './SelectMenu.module.css';

export interface SelectMenuOption {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  disabled?: boolean;
  testId?: string;
}

export interface SelectMenuProps {
  trigger: ReactNode;
  options: SelectMenuOption[];
  onSelect: (option: SelectMenuOption) => void;
  selectedId?: string | null;
  header?: ReactNode;
  footer?: ReactNode;
  triggerClassName?: string;
  paperClassName?: string;
  optionClassName?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  testId?: string;
}

export const SelectMenu = ({
  trigger,
  options,
  onSelect,
  selectedId = null,
  header,
  footer,
  triggerClassName,
  paperClassName,
  optionClassName,
  disabled = false,
  align = 'left',
  testId = 'selectMenu',
}: SelectMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleSelect = (option: SelectMenuOption) => {
    // MUI only blocks disabled items via pointer-events, so guard here too
    if (option.disabled) return;
    onSelect(option);
    setAnchorEl(null);
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.Trigger} ${triggerClassName ?? ''}`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid={testId}
      >
        {trigger}
      </button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: align === 'left' ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: align === 'left' ? 'left' : 'right' }}
        slotProps={{ paper: { className: `${styles.Paper} ${paperClassName ?? ''}` } }}
        data-testid={`${testId}-menu`}
      >
        {header && <div className={styles.Header}>{header}</div>}

        {options.map((option) => (
          <MenuItem
            key={option.id}
            selected={option.id === selectedId}
            disabled={option.disabled}
            onClick={() => handleSelect(option)}
            className={`${styles.Option} ${optionClassName ?? ''}`}
            data-testid={option.testId}
          >
            {option.startAdornment}
            <span className={styles.OptionText}>
              <span className={styles.OptionLabelRow}>
                {option.label}
                {option.endAdornment}
              </span>
              {option.description && <span className={styles.OptionDescription}>{option.description}</span>}
            </span>
          </MenuItem>
        ))}

        {footer && <div className={styles.Footer}>{footer}</div>}
      </Menu>
    </>
  );
};

export default SelectMenu;
