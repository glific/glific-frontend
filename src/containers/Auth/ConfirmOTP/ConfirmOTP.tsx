import React, { useState, useContext } from 'react';
import styles from './ConfirmOTP.module.css';
import { Typography, FormHelperText } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { Button } from '../../../components/UI/Form/Button/Button';
import clsx from 'clsx';
import axios from 'axios';
import { REACT_APP_GLIFIC_REGISTRATION_API } from '../../../common/constants';
import { Redirect } from 'react-router-dom';
import { SessionContext } from '../../../context/session';

export interface ConfirmOTPProps {
  location: any;
}

export const ConfirmOTP: React.SFC<ConfirmOTPProps> = (props) => {
  const { setAuthenticated } = useContext(SessionContext);
  const [userAuthCode, setUserAuthCode] = useState('');
  const [tokenResponse, setTokenResponse] = useState('');
  const [authError, setAuthError] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const handleuserAuthCodeChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAuthCode(event.target.value);
  };

  const handleSubmit = () => {
    if (userAuthCode.length < 6) {
      setAuthError(true);
    } else {
      axios
        .post(REACT_APP_GLIFIC_REGISTRATION_API, {
          user: {
            name: props.location.state.name,
            phone: props.location.state.phoneNumber,
            password: props.location.state.password,
            otp: userAuthCode,
          },
        })
        .then(function (response: any) {
          const responseString = JSON.stringify(response.data.data);
          localStorage.setItem('session', responseString);
          setAuthenticated(true);
          setTokenResponse(responseString);
        })
        .catch(function (error: any) {
          if (error.response.data.error.errors.phone == 'has already been taken') {
            setAlreadyExists(true);
          } else if (error.response.data.error.errors == 'does_not_exist') {
            setAuthError(true);
          }
        });
    }
  };

  if (tokenResponse) {
    return (
      <Redirect
        to={{
          pathname: '/chat',
          state: {
            tokens: tokenResponse,
          },
        }}
      />
    );
  }

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
              error={alreadyExists || authError}
              id="authentication-code"
              label="Authentication Code"
              type="text"
              value={userAuthCode}
              onChange={handleuserAuthCodeChange()}
            />
            <div className="HelperText">
              {authError || alreadyExists ? (
                <FormHelperText>
                  {alreadyExists
                    ? 'An account already exists with this phone number.'
                    : 'Invalid authentication code.'}
                </FormHelperText>
              ) : null}
            </div>
          </FormControl>
        </div>
        <div className="button">
          <Button onClick={handleSubmit} color="primary" variant={'contained'}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOTP;
