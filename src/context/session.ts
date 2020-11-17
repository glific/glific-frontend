import React from 'react';

export const SessionContext = React.createContext({
  authenticated: false,
  setAuthenticated: (value: any) => {
    console.log(value);
  },
});

export default SessionContext;
