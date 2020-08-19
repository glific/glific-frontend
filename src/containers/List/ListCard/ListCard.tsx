import React from 'react';
import { Card, CardContent, Typography, CardActions } from '@material-ui/core';
import styles from './ListCard.module.css';
import { Link } from 'react-router-dom';

interface ListCardProps {
  data: any;
  link: any;
}

export const ListCard: React.SFC<ListCardProps> = (props) => {
  const viewDetails = (
    <Link to={props.link} className={styles.Link}>
      <p>View Details</p>
    </Link>
  );
  return (
    <div className={styles.CardContainer}>
      {props.data.map((data: any) => {
        return (
          <Card variant="outlined" className={styles.Card} key={data.id}>
            <CardContent>
              <div data-testid="label">{data.label}</div>

              <Typography variant="body2" component="p" data-testid="description">
                {data.description}
              </Typography>
            </CardContent>
            <CardActions className={styles.CardActions}>
              {viewDetails}
              {data.operations}
            </CardActions>
          </Card>
        );
      })}
    </div>
  );
};
