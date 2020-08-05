import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { FormHelperText } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import clsx from 'clsx';
import axios from 'axios';

import styles from './Login.module.css';
import { USER_SESSION } from '../../../common/constants';
import { SessionContext } from '../../../context/session';
import Auth from '../Auth';
import PhoneInput from '../../../components/UI/Form/PhoneInput/PhoneInput';

export interface LoginProps {}

export const Login: React.SFC<LoginProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [invalidLogin, setInvalidLogin] = useState(false);

  const handlePasswordChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordError(false);
  };

  const handlePhoneNumberChange = () => (value: string): void => {
    setPhoneNumber(value);
    setPhoneNumberError(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleInputErrors = () => {
    let foundErrors = false;
    if (!phoneNumber) {
      setPhoneNumberError(true);
      foundErrors = true;
    } else if (phoneNumber) {
      setPhoneNumberError(false);
    }
    if (!password) {
      setPasswordError(true);
      foundErrors = true;
    } else if (password) {
      setPasswordError(false);
    }
    return foundErrors;
  };

  const handlerSubmit = () => {
    // set invalid login false as it should be set only on server response
    // errors are handled separately for the client side
    setInvalidLogin(false);

    // if errors just return
    if (handleInputErrors()) {
      return;
    }

    // we should call the backend only if frontend has valid input
    if (!passwordError && !phoneNumberError) {
      axios
        .post(USER_SESSION, {
          user: {
            phone: phoneNumber,
            password: password,
          },
        })
        .then((response: any) => {
          const responseString = JSON.stringify(response.data.data);
          localStorage.setItem('session', responseString);
          setAuthenticated(true);
          setSessionToken(responseString);
        })
        .catch((error: any) => {
          setInvalidLogin(true);
        });
    }
  };

  if (sessionToken) {
    return (
      <Redirect
        to={{
          pathname: '/chat',
          state: {
            tokens: sessionToken,
          },
        }}
      />
    );
  }

  return (
    <Auth
      pageTitle={'Login to your account'}
      buttonText={'LOGIN'}
      alternateLink={'registration'}
      alternateText={'CREATE A NEW ACCOUNT'}
      handlerSubmitCallback={handlerSubmit}
      mode={'login'}
    >
      <div className={styles.Margin}>
        <FormControl className={styles.TextField} variant="outlined">
          <PhoneInput
            inputClass={styles.PhoneNumber}
            data-testid="phoneNumber"
            value={phoneNumber}
            enableSearch={true}
            inputProps={{
              label: 'Your phone number',
              name: 'tel',
              required: true,
              autoFocus: false,
            }}
            onChange={handlePhoneNumberChange()}
            error={phoneNumberError}
            helperText="Please enter a phone number."
          />
        </FormControl>
      </div>
      <div className={clsx(styles.Margin, styles.BottomMargin)}>
        <FormControl className={styles.TextField} variant="outlined">
          <InputLabel classes={{ root: styles.FormLabel }}>Password</InputLabel>
          <OutlinedInput
            classes={{
              root: styles.InputField,
              notchedOutline: styles.InputField,
              focused: styles.InputField,
            }}
            data-testid="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            error={passwordError}
            required
            onChange={handlePasswordChange()}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
          {passwordError ? (
            <FormHelperText classes={{ root: styles.FormHelperText }}>
              Please enter a password.
            </FormHelperText>
          ) : null}
        </FormControl>
      </div>
      {invalidLogin ? <div className={styles.Errors}>Incorrect username or password.</div> : null}
    </Auth>
  );
};

export default Login;
