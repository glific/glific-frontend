import React, { useContext } from 'react';
import { SessionContext } from '../context/session';

export interface AuthServiceProps {
  match: any;
}

const AuthService: React.SFC<AuthServiceProps> = (props) => {
  const { setAuthenticated } = useContext(SessionContext);
  const { match } = props;

  const logoutHandler = () => {
    localStorage.removeItem('session');
    setAuthenticated(false);
  };

  switch (match.path) {
    case '/logout':
      logoutHandler();
      break;
  }

  return <div>Logout</div>;
};

export default AuthService;
