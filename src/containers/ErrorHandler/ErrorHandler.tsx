import React from 'react';
import { useQuery } from '@apollo/client';
import { Container } from '@material-ui/core';
import { ERROR_MESSAGE } from '../../graphql/queries/Notification';

import Loading from '../../components/UI/Layout/Loading/Loading';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import { setErrorMessage } from '../../common/notification';

export interface ErrorHandlerProps {}

export const ErrorHandler: React.SFC<ErrorHandlerProps> = () => {
  const { data, loading, error, client } = useQuery(ERROR_MESSAGE);

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

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
  console.log(data.errorMessage);
  let title = 'An error has occured!';
  // set specific message
  if (data.errorMessage.networkError) {
    title = 'A network error has occured!';
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
        >
          <p>{data.errorMessage.message}</p>
        </DialogBox>
      </div>
    </Container>
  );
};
