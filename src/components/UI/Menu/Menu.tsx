import { useRef, useState } from 'react';
import {
  ClickAwayListener,
  Grow,
  MenuList,
  Paper,
  Popper,
  PopperPlacementType,
} from '@material-ui/core';

import MenuItem from './MenuItem/MenuItem';

export interface MenuProps {
  menus: any;
  eventType?: string | undefined;
  placement?: PopperPlacementType | undefined;
  children?: React.ReactNode;
}

const Menu = ({ menus, children, eventType = 'Click', placement = 'top' }: MenuProps) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const menuList = menus.map((menu: any) => (
    <div key={menu.title}>
      <MenuItem
        onClickHandler={() => {
          if (menu.onClick) {
            menu.onClick();
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
        style={{ zIndex: 1 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
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
