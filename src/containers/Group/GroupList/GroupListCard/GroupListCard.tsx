import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CardActions } from '@material-ui/core';
import styles from './GroupListCard.module.css';

interface GroupListCardProps {
  data: any;
}

export const GroupListCard: React.SFC<GroupListCardProps> = (props) => {
  console.log(props.data);
  return (
    <div className={styles.CardContainer}>
      {props.data.map((group: any) => {
        return (
          <Card variant="outlined" className={styles.Card}>
            <CardContent>
              {group.label}

              <Typography variant="body2" component="p">
                {group.description}
              </Typography>
            </CardContent>
            <CardActions>{group.operations}</CardActions>
          </Card>
        );
      })}
    </div>
  );
};
