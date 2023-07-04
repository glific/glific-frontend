import { createContext } from 'react';
import productTips from '../../productTips';

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

export const SelectedTipContext = createContext({
  selectedtip: productTips[Math.floor(Math.random() * 10)],
});

export default SessionContext;
