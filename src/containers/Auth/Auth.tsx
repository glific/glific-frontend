import React from 'react';

import styles from './Auth.module.css';
import { Typography } from '@material-ui/core';
import { Button } from '../../components/UI/Form/Button/Button';
import { Link } from 'react-router-dom';

export interface AuthProps {
  children: any;
  pageTitle: string;
  buttonText: string;
  alternateLink?: string;
  alternateText?: string;
  handlerSubmitCallback: Function;
}

const Auth: React.SFC<AuthProps> = (props) => {
  return (
    <div className={styles.Container}>
      <div className={styles.Auth}>
        <div className={styles.GlificLogo}>Glific</div>
        <div className={styles.Box}>
          <div className={styles.BoxTitle}>
            <Typography variant="h4" classes={{ root: styles.TitleText }}>
              {props.pageTitle}
            </Typography>
          </div>
          <div className={styles.CenterBox}>
            {props.children}
            <Button
              data-testid="registrationButton"
              onClick={props.handlerSubmitCallback}
              color="primary"
              variant={'contained'}
              className={styles.AuthButton}
            >
              {props.buttonText}
            </Button>
          </div>
        </div>
        <div className={styles.Or}>
          <hr />
          <div className={styles.OrText}>OR</div>
          <hr />
        </div>
        {props.alternateText ? (
          <div>
            <Link to={'/' + props.alternateLink}>{props.alternateText}</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Auth;
