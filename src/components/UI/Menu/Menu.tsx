import { useRef, useState } from 'react';
import {
  ClickAwayListener,
  Grow,
  MenuList,
  Paper,
  Popper,
  PopperPlacementType,
} from '@mui/material';
import styles from './Menu.module.css';

import MenuItem from './MenuItem/MenuItem';

export interface MenuProps {
  menus: any;
  eventType?: string | undefined;
  placement?: PopperPlacementType | undefined;
  children?: React.ReactNode;
  onOpen?: Function;
  onClose?: Function;
}

const Menu = ({
  menus,
  children,
  eventType = 'Click',
  placement = 'top',
  onOpen = () => {},
  onClose = () => {},
}: MenuProps) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setOpen(true);
    onOpen();
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const menuList = menus.map((menu: any) => (
    <div key={menu.title}>
      <MenuItem
        onClickHandler={() => {
          if (menu.onClick) {
            menu.onClick();
            handleClose();
          } else {
            handleClose();
          }
        }}
        {...menu}
      />
    </div>
  ));

  return (
    <div data-testid="Menu">
      <div
        onClick={eventType === 'Click' ? handleOpen : undefined}
        onKeyDown={eventType === 'Click' ? handleOpen : undefined}
        onMouseEnter={eventType === 'MouseEnter' ? handleOpen : undefined}
        onMouseLeave={eventType === 'MouseEnter' ? handleClose : undefined}
        aria-hidden="true"
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
      >
        {children}
      </div>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal={placement === 'top'}
        placement={placement}
        className={styles.Popper}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper className={styles.Popper}>
              <ClickAwayListener onClickAway={handleClose}>
                <div
                  onMouseEnter={eventType === 'MouseEnter' ? handleOpen : undefined}
                  onMouseLeave={eventType === 'MouseEnter' ? handleClose : undefined}
                >
                  <MenuList autoFocusItem={open}>{menuList}</MenuList>
                </div>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
};

export default Menu;
