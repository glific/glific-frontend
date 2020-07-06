import React, { useState } from 'react';
import styles from './Authentication.module.css';
import { Typography } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { Button } from '../../UI/Form/Button/Button';
import { REACT_APP_GLIFIC_CHAT_REDIRECT } from '../../../config/axios';
import clsx from 'clsx';

export interface AuthenticationProps {
  location: any;
}

export const Authentication: React.SFC<AuthenticationProps> = (props) => {
  const [userAuthCode, setuserAuthCode] = useState('');
  const [correctAuthCode, setCorrectAuthCode] = useState(props.location.state.authCode);

  const handleuserAuthCodeChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setuserAuthCode(event.target.value);
  };

  const handleSubmit = () => {
    if (userAuthCode == correctAuthCode) {
      window.location.href = REACT_APP_GLIFIC_CHAT_REDIRECT;
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.CenterRegistrationAuth}>
        <div className={styles.RegistrationAuthTitle}>
          <Typography variant="h5">Authenticate your account.</Typography>
        </div>
        <Typography variant="h6">A code has been sent to your WhatsApp account.</Typography>
        <div className={clsx(styles.Margin, styles.BottomMargin)}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Authentication Code</InputLabel>
            <OutlinedInput
              id="authentication-code"
              label="Authentication Code"
              type="text"
              onChange={handleuserAuthCodeChange()}
            />
          </FormControl>
        </div>
        <Button onClick={handleSubmit} color="primary" variant={'contained'}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Authentication;
