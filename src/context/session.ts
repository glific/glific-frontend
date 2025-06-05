import { createContext } from 'react';

export const ProviderContext = createContext({
  provider: '',
  setProvider: (value: any) => value,
});

export const SideDrawerContext = createContext({
  drawerOpen: false,
  setDrawerOpen: (value: any) => value,
});
