import React from 'react';
import { useQuery } from '@apollo/client';
import { ERROR_MESSAGE } from '../../graphql/queries/Notification';
import Loading from '../../components/UI/Layout/Loading/Loading';
import { Typography, Container } from '@material-ui/core';

export interface ErrorHandlerProps {}

export const ErrorHandler: React.SFC<ErrorHandlerProps> = () => {
  const { data, loading, error } = useQuery(ERROR_MESSAGE);

  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;

  if (!data) {
    return null;
  }

  return (
    <Container>
      <Typography variant="h5">Following error has occured</Typography>
      <p>{data.errorMessage}</p>
    </Container>
  );
};
