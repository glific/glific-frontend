import React from 'react';
import { useQuery } from '@apollo/client';

import { setNotification } from 'common/notification';
import { ToastMessage } from 'components/UI/ToastMessage/ToastMessage';
import { NOTIFICATION } from 'graphql/queries/Notification';

export function useToast() {
  let toastMessage: {} | null | undefined;
  const message = useQuery(NOTIFICATION);

  const closeToastMessage = () => {
    setNotification(null);
  };

  if (message.data && message.data.message) {
    toastMessage = (
      <ToastMessage
        message={message.data.message}
        severity={message.data.severity ? message.data.severity : ''}
        handleClose={closeToastMessage}
      />
    );
  }
  return toastMessage;
}

export default useToast;
