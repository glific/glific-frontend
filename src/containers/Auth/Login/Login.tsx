import React, { useState, useContext } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Typography, FormHelperText } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Button } from '../../../components/UI/Form/Button/Button';
import styles from './Login.module.css';
import { USER_SESSION } from '../../../common/constants';
import clsx from 'clsx';
import axios from 'axios';
import { SessionContext } from '../../../context/session';

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
    if (!phoneNumber) {
      setPhoneNumberError(true);
    } else if (phoneNumber) {
      setPhoneNumberError(false);
    }
    if (!password) {
      setPasswordError(true);
    } else if (password) {
      setPasswordError(false);
    }
  };

  const handleSubmit = () => {
    handleInputErrors();
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
    <div className={styles.Container}>
      <div className={styles.CenterLogin}>
        <div className={styles.LoginTitle}>
          <Typography variant="h5">Login</Typography>
        </div>
        <div className={styles.Margin}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Phone Number</InputLabel>
            <OutlinedInput
              data-testid="phoneNumber"
              error={phoneNumberError}
              id="phone-number"
              label="Phone Number"
              value={phoneNumber}
              type="integer"
              onChange={handlePhoneNumberChange()}
            />
            {phoneNumberError ? (
              <FormHelperText>Please enter a phone number.</FormHelperText>
            ) : null}
          </FormControl>
        </div>
        <div className={clsx(styles.Margin, styles.BottomMargin)}>
          <FormControl className={styles.TextField} variant="outlined">
            <InputLabel>Password</InputLabel>
            <OutlinedInput
              data-testid="password"
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
            {passwordError ? <FormHelperText>Please enter a password.</FormHelperText> : null}
          </FormControl>
        </div>
        {invalidLogin ? <div className={styles.Errors}>Incorrect username or password.</div> : null}
        <Button onClick={handleSubmit} color="primary" variant={'contained'}>
          Login
        </Button>
        <br />
        <div>OR</div>
        <div>
          <Link to="/registration">CREATE A NEW ACCOUNT</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
