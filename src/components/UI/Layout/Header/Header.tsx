import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  makeStyles,
  createStyles,
  Theme,
} from '@material-ui/core';
import AccountCircleSharpIcon from '@material-ui/icons/AccountCircleSharp';
import MenuIcon from '@material-ui/icons/Menu';

export interface HeaderProps {
  MenuToggle: () => void;
}

const drawerWidth = 200;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      [theme.breakpoints.up('sm')]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    typographyStyle: {
      flex: 1,
    },
  })
);

export const Header: React.SFC<HeaderProps> = (props: HeaderProps) => {
  const classes = useStyles();

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={props.MenuToggle}
          className={classes.menuButton}
        >
          <MenuIcon />
        </IconButton>
        <Typography className={classes.typographyStyle} variant="h6" noWrap>
          Glific
        </Typography>
        <AccountCircleSharpIcon />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
