import { createContext } from 'react';

export const SessionContext = createContext({
  authenticated: false,
  setAuthenticated: (value: any) => value,
});

export const ProviderContext = createContext({
  provider: '',
  setProvider: (value: any) => value,
});
export default SessionContext;
