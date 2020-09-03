import React from 'react';
import { useQuery } from '@apollo/client';
import { Container } from '@material-ui/core';

import { ERROR_MESSAGE } from '../../graphql/queries/Notification';
import Loading from '../../components/UI/Layout/Loading/Loading';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import { setErrorMessage } from '../../common/notification';
import { renewAuthToken } from '../../services/AuthService';

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

  if (data.errorMessage.networkError) {
    // set specific message for network error
    title = 'A network error has occured!';

    // if we get 401 authentication error then let's attempt to auto renew
    // the token / session
    if (data.errorMessage.networkError.statusCode === 401) {
      renewAuthToken().then((response: any) => {
        console.log('renewal', response);
        if (response?.renewStatus) {
          // this is hack to reload the page after token as been renewed
          window.location.reload();
        }
      });
    }
  }

  let errorMesageToDisplay = <p>{data.errorMessage.message}</p>;

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
          {errorMesageToDisplay}
        </DialogBox>
      </div>
    </Container>
  );
};
