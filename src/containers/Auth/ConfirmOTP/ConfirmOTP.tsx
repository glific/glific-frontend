import React, { useState, useContext } from 'react';
import styles from './ConfirmOTP.module.css';
import { Typography, FormHelperText, makeStyles, createStyles } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { Button } from '../../../components/UI/Form/Button/Button';
import clsx from 'clsx';
import axios from 'axios';
import {
  REACT_APP_GLIFIC_REGISTRATION_API,
  REACT_APP_GLIFIC_AUTHENTICATION_API,
} from '../../../common/constants';
import { Redirect } from 'react-router-dom';
import { SessionContext } from '../../../context/session';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';

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

  const handleResend = () => {
    axios
      .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
        user: {
          phone: props.location.state.phoneNumber,
        },
      })
      .then((response: any) => {
        console.log(response);
      })
      .catch((error: any) => {
        console.log(error);
      });
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
          if (error.response.data.error.errors.phone === 'has already been taken') {
            setAlreadyExists(true);
          } else if (error.response.data.error.errors === 'does_not_exist') {
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
        <div className={styles.GlificLogo}>Glific</div>
        <div className={styles.Box}>
          <div className={styles.RegistrationAuthTitle}>
            <Typography variant="h4" className={styles.TitleText}>
              Create your new <br />
              account
            </Typography>
          </div>
          <div className={clsx(styles.Margin, styles.BottomMargin)}>
            <FormControl className={styles.TextField} variant="outlined">
              <InputLabel classes={{ root: styles.FormLabel }}>OTP</InputLabel>
              <OutlinedInput
                classes={{
                  root: styles.InputField,
                  notchedOutline: styles.InputField,
                  input: styles.Input,
                }}
                error={alreadyExists || authError}
                id="authentication-code"
                label="OTP"
                type="text"
                value={userAuthCode}
                onChange={handleuserAuthCodeChange()}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleResend}
                      edge="end"
                    >
                      <p className={styles.Resend}>resend</p>{' '}
                      <RefreshIcon classes={{ root: styles.IconButton }} />
                    </IconButton>
                  </InputAdornment>
                }
              />
              <div>
                <FormHelperText classes={{ root: styles.FormHelperText }}>
                  Please confirm the OTP received by your WhatsApp <br />
                  number.
                </FormHelperText>
                {authError || alreadyExists ? (
                  <FormHelperText classes={{ root: styles.InvalidFormHelperText }}>
                    {alreadyExists
                      ? 'An account already exists with this phone number.'
                      : 'Invalid authentication code.'}
                  </FormHelperText>
                ) : null}
              </div>
            </FormControl>
          </div>
          <div className="button">
            <Button
              className={styles.ContinueButton}
              onClick={handleSubmit}
              color="primary"
              variant={'contained'}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOTP;
