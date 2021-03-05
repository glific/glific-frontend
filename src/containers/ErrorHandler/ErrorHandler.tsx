import React from 'react';
import { useQuery } from '@apollo/client';
import { Container } from '@material-ui/core';
import styles from './ErrorHandler.module.css';

import { ERROR_MESSAGE } from '../../graphql/queries/Notification';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import { setErrorMessage } from '../../common/notification';
import setLogs from '../../config/logs';

export interface ErrorHandlerProps {}

export const ErrorHandler: React.SFC<ErrorHandlerProps> = () => {
  const { data, client } = useQuery(ERROR_MESSAGE);
  let { message } = data ? data.errorMessage : '';

  if (!data) {
    return null;
  }

  const handleErrorClose = () => {
    setErrorMessage(client, '');
  };

  // return if error is cleared or not set
  if (data.errorMessage === '') {
    return null;
  }

  // Handle type of error message
  let title = 'An error has occurred!';

  if (data.errorMessage.networkError) {
    // set specific message for network error
    title = 'A network error has occurred!';
  }

  if (data.errorMessage.title) {
    // set specific title for error
    title = data.errorMessage.title;
  }

  // for multiple message
  if (Array.isArray(data.errorMessage.message)) {
    message = data.errorMessage.message.map((e: any) => <div>{e.message}</div>);
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
        >
          <p className={styles.Message}>{message}</p>
        </DialogBox>
      </div>
    </Container>
  );
};
