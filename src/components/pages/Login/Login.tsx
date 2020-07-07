import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Button } from '../../UI/Form/Button/Button';
import styles from './Login.module.css';
import {
  REACT_APP_GLIFIC_NEW_SESSION_EXISTING_USER,
  REACT_APP_GLIFIC_AUTHENTICATION_API,
} from '../../../common/constants';
import clsx from 'clsx';
import axios from 'axios';

export interface LoginProps {}

export const Login: React.SFC<LoginProps> = () => {
  const [password, setPassword] = useState('');
  const [phoneNumber, setphoneNumber] = useState('');
  const [showPassword, setshowPassword] = useState(false);
  const [sessionToken, setsessionToken] = useState('');
  const [authCode, setauthCode] = useState();
  const [errors, setErrors] = useState();

  const handlePasswordChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handlephoneNumberChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setphoneNumber(event.target.value);
  };

  const handleClickShowPassword = () => {
    setshowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = () => {
    axios
      .post(REACT_APP_GLIFIC_NEW_SESSION_EXISTING_USER, {
        user: {
          phone: phoneNumber,
          password: password,
        },
      })
      .then(function (response: any) {
        const responseString = JSON.stringify(response.data.data);
        setsessionToken(responseString);
        axios
          .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
            user: {
              phone: phoneNumber,
            },
          })
          .then(function (response: any) {
            setauthCode(response.data.data.otp);
          });
      })
      .catch(function (error: any) {
        console.log(error.response.data.error.message);
        setErrors(error.response.data.error.message);
      });
  };

  if (authCode && sessionToken) {
    return (
      <Redirect
        to={{
          pathname: '/confirmotp',
          state: {
            authCode: authCode,
            phoneNumber: phoneNumber,
            tokens: sessionToken,
          },
        }}
      />
    );
  }

  return (
    <div className={styles.Container}>
      <div className={styles.CenterLogin}>
        <div className={styles.LoginTitle}>
          <Typography variant="h5">Login</Typography>
        </div>
        <div className={styles.Margin}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Phone Number</InputLabel>
            <OutlinedInput
              id="phone-number"
              label="Phone Number"
              value={phoneNumber}
              type="integer"
              onChange={handlephoneNumberChange()}
            />
          </FormControl>
        </div>
        <div className={clsx(styles.Margin, styles.BottomMargin)}>
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
        {errors ? <div className={styles.Errors}>{errors}</div> : null}
        <Button onClick={handleSubmit} color="primary" variant={'contained'}>
          Login
        </Button>
      </div>
    </div>
  );
};

export default Login;
