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

  if (!data.errorMessage) {
    return null;
  }

  // Handle type of error message
  console.log(data.errorMessage);
  let title = 'An error has occured!';
  let colorOk = 'colorOk = "primary"';
  if (data.errorMessage.type === 'Error') {
    colorOk = 'colorOk = "secondary"';
  }

  return (
    <Container>
      <DialogBox
        title={title}
        {...colorOk}
        handleOk={handleErrorClose}
        handleCancel={handleErrorClose}
        buttonOk="Ok"
        skipCancel
      >
        <p>{data.errorMessage.message}</p>
      </DialogBox>
    </Container>
  );
};
