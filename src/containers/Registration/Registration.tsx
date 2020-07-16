import React, { useState } from 'react';
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
import { Redirect, Link } from 'react-router-dom';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../common/constants';
import clsx from 'clsx';
import axios from 'axios';

export interface RegistrationProps {}

export const Registration: React.SFC<RegistrationProps> = () => {
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userNameError, setUserNameError] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
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
  };

  const handleSubmit = () => {
    handleInputErrors();
    if (!userNameError && !phoneNumberError && !passwordError) {
      axios
        .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
          user: {
            phone: phoneNumber,
          },
        })
        .then((response: any) => {
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
              value={phoneNumber}
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
        <Button onClick={handleSubmit} color="primary" variant={'contained'}>
          Submit
        </Button>
        <br />
        <div>OR</div>
        <div>
          <Link to="/login">LOGIN TO GLIFIC</Link>
        </div>
      </div>
    </div>
  );
};

export default Registration;
