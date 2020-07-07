import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
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
import {
  REACT_APP_GLIFIC_REGISTRATION_API,
  REACT_APP_GLIFIC_AUTHENTICATION_API,
} from '../../../config/axios';
import clsx from 'clsx';
import axios from 'axios';

export interface RegistrationProps {}

export const Registration: React.SFC<RegistrationProps> = () => {
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setphoneNumber] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [showPassword, setshowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);
  const [authToken, setauthToken] = useState('');
  const [authCode, setauthCode] = useState();
  const [errors, setErrors] = useState();

  const handlePasswordChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleuserNameChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handlephoneNumberChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setphoneNumber(event.target.value);
  };

  const handleconfirmPasswordChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setconfirmPassword(event.target.value);
  };

  const handleClickShowPassword = () => {
    setshowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setshowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseDownConfirmPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = () => {
    axios
      .post(REACT_APP_GLIFIC_REGISTRATION_API, {
        user: {
          name: userName,
          phone: phoneNumber,
          password: password,
          password_confirmation: confirmPassword,
        },
      })
      .then(function (response: any) {
        const responseString = JSON.stringify(response);
        setauthToken(responseString);
        axios
          .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
            user: {
              phone: phoneNumber,
            },
          })
          .then(function (response: any) {
            setauthCode(response);
          });
      })
      .catch(function (error: any) {
        setErrors(error.response.data.error.errors);
      });
  };

  if (authCode && authToken) {
    return (
      <Redirect
        to={{
          pathname: '/authentication',
          state: {
            authCode: authCode.data.data.otp,
            phoneNumber: phoneNumber,
            tokens: authToken,
          },
        }}
      />
    );
  }

  const errorList = errors
    ? Object.values(errors).map((error: any) =>
        error[0] == 'does not match confirmation' ? (
          <h5 className={styles.ErrorText}>Password {error[0]} </h5>
        ) : (
          <h5 className={styles.ErrorText}>Fields {error[0]}</h5>
        )
      )
    : null;

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
              id="username"
              label="Username"
              type="text"
              value={userName}
              onChange={handleuserNameChange()}
            />
          </FormControl>
        </div>
        <div className={styles.Margin}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Phone Number</InputLabel>
            <OutlinedInput
              id="phone-number"
              label="Phone Number"
              type="integer"
              onChange={handlephoneNumberChange()}
            />
          </FormControl>
        </div>
        <div className={clsx(styles.Margin)}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Password</InputLabel>
            <OutlinedInput
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
          </FormControl>
        </div>
        <div className={clsx(styles.Margin, styles.BottomMargin)}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Confirm Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              value={confirmPassword}
              onChange={handleconfirmPasswordChange()}
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
          </FormControl>
        </div>
        {errors ? <div className={styles.Errors}>{errorList}</div> : null}
        <Button onClick={handleSubmit} color="primary" variant={'contained'}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Registration;
