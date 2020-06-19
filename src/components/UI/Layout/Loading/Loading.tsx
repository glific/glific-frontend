import React from 'react';
import { CircularProgress, Typography } from '@material-ui/core';

import styles from './Loading.module.css';

export interface LoadingProps { }

export const Loading: React.SFC<LoadingProps> = () => {
    return (
        <div className={styles.CenterItems}>
            <div className={styles.LoadingPadding}>
                <CircularProgress />
            </div>
            <Typography variant="h5">
                Loading...
            </Typography>
        </div >
    );
};

export default Loading