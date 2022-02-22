import React from 'react';
import { useQuery } from '@apollo/client';
import { Container } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { ERROR_MESSAGE } from 'graphql/queries/Notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setErrorMessage } from 'common/notification';
import setLogs from 'config/logs';

export interface ErrorHandlerProps {}

export const ErrorHandler: React.SFC<ErrorHandlerProps> = () => {
  const { t } = useTranslation();
  const { data } = useQuery(ERROR_MESSAGE);
  let { message } = data ? data.errorMessage : '';

  if (!data) {
    return null;
  }

  const handleErrorClose = () => {
    setErrorMessage('');
  };

  // return if error is cleared or not set
  if (data.errorMessage === '') {
    return null;
  }

  // Handle type of error message
  let title = t('An error has occurred!');

  if (data.errorMessage.networkError) {
    // set specific message for network error
    title = t('A network error has occurred!');
  }

  if (data.errorMessage.title) {
    // set specific title for error
    title = data.errorMessage.title;
  }

  // for multiple message
  if (Array.isArray(data.errorMessage.message)) {
    message = data.errorMessage.message.map((e: any, index: number) => {
      const key = `message-${index}`;
      return <div key={key}>{e.message}</div>;
    });
  }

  // logged error in logflare
  setLogs(data.errorMessage, 'error');

  return (
    <Container>
      <div data-testid="errorMessage">
        <DialogBox
          title={title}
          colorOk="secondary"
          handleOk={handleErrorClose}
          handleCancel={handleErrorClose}
          buttonOk="Ok"
          skipCancel
          alignButtons="center"
          contentAlign="center"
        >
          {message}
        </DialogBox>
      </div>
    </Container>
  );
};
