import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CardActions } from '@material-ui/core';
import styles from './GroupListCard.module.css';
import { Link } from 'react-router-dom';

interface GroupListCardProps {
  data: any;
}

export const GroupListCard: React.SFC<GroupListCardProps> = (props) => {
  console.log(props.data);
  const viewDetails = (
    <Link to="/group/members" className={styles.Link}>
      <p>View Details</p>
    </Link>
  );
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
            <CardActions className={styles.CardActions}>
              {viewDetails}
              {group.operations}
            </CardActions>
          </Card>
        );
      })}
    </div>
  );
};
