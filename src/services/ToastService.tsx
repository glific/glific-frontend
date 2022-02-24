import React from 'react';
import { useApolloClient, useQuery } from '@apollo/client';

import { setNotification } from 'common/notification';
import { ToastMessage } from 'components/UI/ToastMessage/ToastMessage';
import { NOTIFICATION } from 'graphql/queries/Notification';

export function useToast() {
  const client = useApolloClient();

  let toastMessage: {} | null | undefined;
  const message = useQuery(NOTIFICATION);

  const closeToastMessage = () => {
    setNotification(client, null);
  };

  if (message.data && message.data.message) {
    toastMessage = (
      <ToastMessage
        message={message.data.message}
        severity={message.data.severity ? message.data.severity : ''}
        handleClose={closeToastMessage}
        hideDuration={message.data.hideDuration}
      />
    );
  }
  return toastMessage;
}

export default useToast;
