import React, { useState } from 'react';
import { Typography, FormHelperText, makeStyles, createStyles } from '@material-ui/core';
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
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';
import clsx from 'clsx';
import axios from 'axios';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

export interface RegistrationProps {}
const useStyles = makeStyles(() =>
  createStyles({
    continueButton: {
      width: '310px',
      borderRadius: '27px',
      marginTop: '32px',
    },
    inputField: {
      lineHeight: '32px',
    },
    titleText: {
      fontWeight: 'bold',
    },
  })
);

export const Registration: React.SFC<RegistrationProps> = () => {
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userNameError, setUserNameError] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const classes = useStyles();

  const theme = createMuiTheme({
    overrides: {
      MuiOutlinedInput: {
        root: {
          '& $notchedOutline': {
            borderColor: '#93A29B',
            borderRadius: '12px',
            borderWidth: '2px',
          },
          '&$focused $notchedOutline': {
            borderColor: '#93A29B',
          },
          '&:hover $notchedOutline': {
            borderColor: '#93A29B',
          },
        },
      },
      MuiFormLabel: {
        root: {
          color: '#93A29B',
          '&$focused': {
            color: '#93A29B',
          },
        },
      },
      MuiInputBase: {
        root: {
          lineHeight: '32px',
          width: '340px',
        },
      },
      MuiIconButton: {
        root: {
          color: '#93A29B',
        },
      },
      MuiInputLabel: {
        root: {
          color: '#93A29B',
        },
      },
    },
  });

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
        .catch((error: any) => {});
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
        <div className={styles.Box}>
          <div className={styles.BoxTitle}>
            <Typography variant="h4" className={classes.titleText}>
              Create your new <br /> account
            </Typography>
          </div>
          <div className={styles.CenterBox}>
            <div className={styles.Margin}>
              <FormControl className={styles.TextField} variant="outlined">
                <ThemeProvider theme={theme}>
                  <InputLabel>Your full name</InputLabel>
                  <OutlinedInput
                    error={userNameError}
                    id="username"
                    label="Your full name"
                    type="text"
                    value={userName}
                    onChange={handleUserNameChange()}
                  />
                </ThemeProvider>
                {userNameError ? <FormHelperText>Invalid username.</FormHelperText> : null}
              </FormControl>
            </div>
            <div className={styles.Margin}>
              <FormControl className={styles.TextField} variant="outlined">
                <ThemeProvider theme={theme}>
                  <InputLabel>Your phone number</InputLabel>
                  <OutlinedInput
                    error={phoneNumberError}
                    id="phone-number"
                    label="Your phone number"
                    type="integer"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange()}
                  />
                </ThemeProvider>
                {phoneNumberError ? <FormHelperText>Invalid phone number.</FormHelperText> : null}
              </FormControl>
            </div>
            <div className={clsx(styles.Margin)}>
              <FormControl className={styles.TextField} variant="outlined">
                <ThemeProvider theme={theme}>
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput
                    error={passwordError}
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    value={password}
                    onChange={handlePasswordChange()}
                    endAdornment={
                      <ThemeProvider theme={theme}>
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
                      </ThemeProvider>
                    }
                  />
                </ThemeProvider>
                {passwordError ? (
                  <FormHelperText>Invalid password, must be at least 8 characters.</FormHelperText>
                ) : null}
              </FormControl>
            </div>
            <Button
              onClick={handleSubmit}
              color="primary"
              variant={'contained'}
              className={classes.continueButton}
            >
              CONTINUE
            </Button>
          </div>
        </div>
        <div className={styles.Or}>
          <hr />
          <div className={styles.OrText}>OR</div>
          <hr />
        </div>
        <div className={styles.Link}>
          <Link to="/login">LOGIN TO GLIFIC</Link>
        </div>
      </div>
    </div>
  );
};

export default Registration;
