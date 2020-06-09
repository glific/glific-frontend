import React from 'react';
import { Typography } from '@material-ui/core';

export interface ContactBarProps {}

export const ContactBar: React.SFC<ContactBarProps> = () => {
  return (
    <div>
      <Typography variant="h6">Jane Doe</Typography>
    </div>
  );
};

export default ContactBar;
