import React, { useRef, useState } from 'react';
import { Grow, MenuList, Paper, Popper } from '@material-ui/core';

import MenuItem from './MenuItem/MenuItem';

export interface MenuProps {
  menus: any;
  eventType?: string | undefined;
}

const Menu: React.SFC<MenuProps> = ({ menus, children, eventType = 'Click' }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const menuList = menus.map((menu: any) => (
    <div key={menu.title}>
      <MenuItem onClickHandler={handleClose} {...menu} />
    </div>
  ));

  return (
    <div data-testid="Menu">
      <div
        onClick={eventType === 'Click' ? handleToggle : undefined}
        onKeyDown={eventType === 'Click' ? handleToggle : undefined}
        onMouseEnter={eventType === 'MouseEnter' ? handleToggle : undefined}
        aria-hidden="true"
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
      >
        {children}
      </div>

      <div onMouseLeave={eventType === 'MouseEnter' ? handleClose : undefined}>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <MenuList>{menuList}</MenuList>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </div>
  );
};

export default Menu;
