import React from 'react';

export const SessionContext = React.createContext({
  authenticated: false,
  setAuthenticated: (value: any) => value,
});

export const SideDrawerContext = React.createContext({
  drawerOpen: false,
  setDrawerOpen: (value: any) => value,
});

export default SessionContext;
