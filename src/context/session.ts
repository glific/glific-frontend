import { createContext } from 'react';

export const SessionContext = createContext({
  authenticated: false,
  setAuthenticated: (value: any) => value,
});

export const ProviderContext = createContext({
  provider: '',
  setProvider: (value: any) => value,
});

export const SideDrawerContext = createContext({
  drawerOpen: false,
  setDrawerOpen: (value: any) => value,
});

export const RandomValueContext = createContext({
  randomValue: Math.floor(Math.random() * 10),
  setRandomValue: (value: any) => value,
});

export default SessionContext;
