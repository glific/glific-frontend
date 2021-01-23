import React from 'react';
import { useQuery } from '@apollo/client';
import { Container } from '@material-ui/core';

import { ERROR_MESSAGE } from '../../graphql/queries/Notification';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import { setErrorMessage } from '../../common/notification';

export interface ErrorHandlerProps {}

export const ErrorHandler: React.SFC<ErrorHandlerProps> = () => {
  const { data, client } = useQuery(ERROR_MESSAGE);

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
          <p style={{ textAlign: 'center' }}>{data.errorMessage.message}</p>
        </DialogBox>
      </div>
    </Container>
  );
};
