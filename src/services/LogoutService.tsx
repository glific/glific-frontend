import React from 'react';
import { useQuery } from '@apollo/client';

import { LOGOUT_SESSION } from 'graphql/queries/Notification';
import { Logout } from 'containers/Auth/Logout/Logout';

export function useLogout() {
  let dialog: {} | null | undefined;
  const message = useQuery(LOGOUT_SESSION);

  if (message.data && message.data.sessionExpired) {
    dialog = <Logout match={{ params: { mode: 'session' } }} />;
  }
  return dialog;
}

export default useLogout;
