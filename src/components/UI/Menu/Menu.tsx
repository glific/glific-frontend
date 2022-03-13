import React, { useRef, useState } from 'react';
import { ClickAwayListener, Grow, MenuList, Paper, Popper } from '@material-ui/core';

import MenuItem from './MenuItem/MenuItem';

export interface MenuProps {
  menus: any;
  eventType?: string | undefined;
}

const Menu: React.SFC<MenuProps> = ({ menus, children, eventType = 'Click' }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current === event.target) {
      return;
    }
    setOpen(false);
  };

  const menuList = menus.map((menu: any) => (
    <div key={menu.title}>
      <MenuItem
        onClickHandler={() => {
          if (menu.onClick) {
            menu.onClick();
          } else {
            setOpen(false);
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

      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open}>{menuList}</MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
};

export default Menu;
