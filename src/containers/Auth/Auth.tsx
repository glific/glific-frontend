import React from 'react';

import styles from './Auth.module.css';
import { Typography } from '@material-ui/core';
import { Button } from '../../components/UI/Form/Button/Button';
import { Link } from 'react-router-dom';

export interface AuthProps {}

const Auth: React.SFC<AuthProps> = (props) => {
  return (
    <div className={styles.Container}>
      <div className={styles.Auth}>
        <div className={styles.GlificLogo}>Glific</div>
        <div className={styles.Box}>
          <div className={styles.BoxTitle}>
            <Typography variant="h4" classes={{ root: styles.TitleText }}>
              Create your new <br /> account
            </Typography>
          </div>
          <div className={styles.CenterBox}>
            {props.children}
            <Button
              data-testid="registrationButton"
              //onClick={handleSubmit}
              color="primary"
              variant={'contained'}
              className={styles.ContinueButton}
            >
              CONTINUE
            </Button>
          </div>
        </div>
        <div className={styles.Or}>
          <hr />
          <div className={styles.OrText}>OR</div>
          <hr />
        </div>
        <div className={styles.Link}>
          <Link to="/login">LOGIN TO GLIFIC</Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
