import React from 'react';
import { useQuery } from '@apollo/client';
import { Container } from '@material-ui/core';
import { Redirect } from 'react-router';

import { ERROR_MESSAGE } from '../../graphql/queries/Notification';
import Loading from '../../components/UI/Layout/Loading/Loading';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import { setErrorMessage } from '../../common/notification';

export interface ErrorHandlerProps {}

export const ErrorHandler: React.SFC<ErrorHandlerProps> = () => {
  const { data, loading, client } = useQuery(ERROR_MESSAGE);

  if (loading) return <Loading />;

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
  let title = 'An error has occured!';
  // set specific message
  if (data.errorMessage.networkError) {
    title = 'A network error has occured!';

    // if we get authentication errors, then gracefully logout the user
    // instead of showing error message. This can be happen due to wierd
    // state of tokens
    if (data.errorMessage.networkError.statusCode === 401) {
      return <Redirect to="/logout" />;
    }
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
