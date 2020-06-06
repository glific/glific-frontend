import React from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core';

export interface ContentProps {}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
  })
);

export const Content: React.SFC<ContentProps> = (props) => {
  const classes = useStyles();
  return (
    <main className={classes.content}>
      <div className={classes.toolbar} />
      <div>{props.children}</div>
    </main>
  );
};

export default Content;
