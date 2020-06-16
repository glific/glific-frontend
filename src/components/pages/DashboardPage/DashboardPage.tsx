import React from 'react';
import { Typography } from '@material-ui/core';

export interface DashboardPageProps {}

export const DashboardPage: React.SFC<DashboardPageProps> = () => {
  return (
    <div>
      <Typography variant="h5">Welcome to Glific!</Typography>
    </div>
  );
};
