import React, { useState, useContext } from 'react';
import { Typography, FormHelperText } from '@material-ui/core';
import styles from './Registration.module.css';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router-dom';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';
import clsx from 'clsx';
import axios from 'axios';
import { SessionContext } from '../../../common/session';

export interface RegistrationProps {}

export const Registration: React.SFC<RegistrationProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userNameError, setUserNameError] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  const handlePasswordChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleUserNameChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handlePhoneNumberChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const handleConfirmPasswordChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseDownConfirmPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleInputErrors = () => {
    if (!userName) {
      setUserNameError(true);
    } else if (userName) {
      setUserNameError(false);
    }
    if (!phoneNumber) {
      setPhoneNumberError(true);
    } else if (phoneNumber) {
      setPhoneNumberError(false);
    }
    if (!password || password.length < 8) {
      setPasswordError(true);
    } else if (password) {
      setPasswordError(false);
    }
    if (password != confirmPassword) {
      setConfirmPasswordError(true);
    } else if (confirmPassword) {
      setConfirmPasswordError(false);
    }
  };

  const handleSubmit = () => {
    handleInputErrors();
    if (!userNameError && !phoneNumberError && !passwordError && !confirmPasswordError) {
      axios
        .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
          user: {
            phone: phoneNumber,
          },
        })
        .then((response: any) => {
          localStorage.setItem('session', response.data.data);
          setAuthenticated(true);
          setAuthMessage(response);
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
  };

  if (authMessage) {
    return (
      <Redirect
        to={{
          pathname: '/confirmotp',
          state: {
            name: userName,
            phoneNumber: phoneNumber,
            password: password,
            password_confirmation: confirmPassword,
          },
        }}
      />
    );
  }

  return (
    <div className={styles.Container}>
      <div className={styles.CenterRegistration}>
        <div className={styles.RegistrationTitle}>
          <Typography variant="h5">Create a New Account</Typography>
        </div>
        <div className={styles.Margin}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Username</InputLabel>
            <OutlinedInput
              error={userNameError}
              id="username"
              label="Username"
              type="text"
              value={userName}
              onChange={handleUserNameChange()}
            />
            {userNameError ? <FormHelperText>Invalid username.</FormHelperText> : null}
          </FormControl>
        </div>
        <div className={styles.Margin}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Phone Number</InputLabel>
            <OutlinedInput
              error={phoneNumberError}
              id="phone-number"
              label="Phone Number"
              type="integer"
              onChange={handlePhoneNumberChange()}
            />
            {phoneNumberError ? <FormHelperText>Invalid phone number.</FormHelperText> : null}
          </FormControl>
        </div>
        <div className={clsx(styles.Margin)}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Password</InputLabel>
            <OutlinedInput
              error={passwordError}
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
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
              <FormHelperText>Invalid password, must be at least 8 characters.</FormHelperText>
            ) : null}
          </FormControl>
        </div>
        <div className={clsx(styles.Margin, styles.BottomMargin)}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Confirm Password</InputLabel>
            <OutlinedInput
              error={confirmPasswordError}
              id="outlined-adornment-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange()}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownConfirmPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {confirmPasswordError ? <FormHelperText>Passwords do not match.</FormHelperText> : null}
          </FormControl>
        </div>
        <Button onClick={handleSubmit} color="primary" variant={'contained'}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Registration;
