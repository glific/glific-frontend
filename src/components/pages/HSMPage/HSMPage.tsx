import React from 'react';
import { Typography } from '@material-ui/core';
import { GET_HSM_TEMPLATES } from '../../../graphql/queries/Template';
import { useQuery } from '@apollo/client';

export interface HSMPageProps {}

export const HSMPage: React.SFC<HSMPageProps> = () => {
  const templates = useQuery(GET_HSM_TEMPLATES);

  console.log(templates);

  return (
    <div>
      <Typography variant="h5">HSM Message Templates</Typography>
    </div>
  );
};
