import React from 'react';
import { Typography } from '@material-ui/core';

export interface HSMPageProps {}

export const HSMPage: React.SFC<HSMPageProps> = () => {
  return (
    <div>
      <Typography variant="h5">HSM Message Templates</Typography>
    </div>
  );
};
