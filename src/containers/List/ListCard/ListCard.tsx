import React from 'react';
import { Card, CardContent, Typography, CardActions } from '@material-ui/core';
import styles from './ListCard.module.css';
import { Link } from 'react-router-dom';

interface ListCardProps {
  data: any;
  link: any;
}

export const ListCard: React.SFC<ListCardProps> = (props) => {
  const link = (id: any) => '/' + props.link.start + '/' + id + '/' + props.link.end;
  const viewDetails = (id: any) => (
    <Link to={link(id)} className={styles.Link}>
      <p>View Details</p>
    </Link>
  );
  return (
    <div className={styles.CardContainer}>
      {props.data.map((data: any) => {
        return (
          <Card variant="outlined" className={styles.Card} key={data.id}>
            <CardContent className={styles.CardContent}>
              <div data-testid="label">{data.label}</div>

              <Typography variant="body2" component="div" data-testid="description">
                {data.description}
              </Typography>
            </CardContent>
            <CardActions className={styles.CardActions}>
              {viewDetails(data.id)}
              {data.operations}
            </CardActions>
          </Card>
        );
      })}
    </div>
  );
};
