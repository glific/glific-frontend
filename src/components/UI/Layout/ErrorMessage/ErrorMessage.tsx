import React from 'react';
import { AlertTitle, Alert } from '@material-ui/lab';

import styles from './ErrorMessage.module.css'

export interface ErrorMessageProps {
    error: any;
}

export const ErrorMessage: React.SFC<ErrorMessageProps> = (props) => {
    return (
        <div className={styles.TopPadding}>
            <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
            Warning: {props.error}
            </Alert>
        </div>
    );
};

export default ErrorMessage