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
  mode: string;
}

const Auth: React.SFC<AuthProps> = (props) => {
  const boxClass = [styles.Box];
  const boxTitleClass = [styles.BoxTitle];
  const buttonClass = [styles.AuthButton];
  switch (props.mode) {
    case 'login':
      boxClass.push(styles.LoginBox);
      boxTitleClass.push(styles.LoginBoxTitle);
      buttonClass.push(styles.LoginButton);
      break;
    case 'registration':
      boxClass.push(styles.RegistrationBox);
      boxTitleClass.push(styles.RegistrationBoxTitle);
      break;
    case 'confirmotp':
      boxClass.push(styles.OTPBox);
      boxTitleClass.push(styles.RegistrationBoxTitle);
      break;
  }

  return (
    <div className={styles.Container}>
      <div className={styles.Auth}>
        <div className={styles.GlificLogo}>Glific</div>
        <div className={boxClass.join(' ')}>
          <div className={boxTitleClass.join(' ')}>
            <Typography variant="h4" classes={{ root: styles.TitleText }}>
              {props.pageTitle}
            </Typography>
          </div>
          <div className={styles.CenterBox}>{props.children}</div>
        </div>
        {props.alternateText ? (
          <>
            <div className={styles.Or}>
              <hr />
              <div className={styles.OrText}>OR</div>
              <hr />
            </div>
            <div>
              <Link to={'/' + props.alternateLink}>{props.alternateText}</Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Auth;
