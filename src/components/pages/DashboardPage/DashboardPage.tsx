import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import ToastMessage from '../../UI/ToastMessage/ToastMessage';

export interface DashboardPageProps {}

export const DashboardPage: React.SFC<DashboardPageProps> = () => {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <Typography variant="h5">Welcome to Glific!</Typography>
      <ToastMessage open={open} message="message" severity="success" handleClose={setOpen} />
    </div>
  );
};
