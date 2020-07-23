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
import { Button } from '../../../components/UI/Form/Button/Button';
import { Redirect, Link } from 'react-router-dom';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';
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
  const [errorMessage, setErrorMessage] = useState('');

  const handlePasswordChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordError(false);
  };

  const handleUserNameChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
    setUserNameError(false);
  };

  const handlePhoneNumberChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
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
    if (!userName) {
      setUserNameError(true);
      foundErrors = true;
    } else if (userName) {
      setUserNameError(false);
    }
    if (!phoneNumber) {
      setPhoneNumberError(true);
      foundErrors = true;
    } else if (phoneNumber) {
      setPhoneNumberError(false);
    }
    if (!password || password.length < 8) {
      setPasswordError(true);
      foundErrors = true;
    } else if (password) {
      setPasswordError(false);
    }

    return foundErrors;
  };

  const handleSubmit = () => {
    // if errors just return
    if (handleInputErrors()) {
      return;
    }

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
          setErrorMessage(error.response.data.error.message);
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
        <div className={styles.GlificLogo}>Glific</div>
        <div className={styles.Box}>
          <div className={styles.BoxTitle}>
            <Typography variant="h4" classes={{ root: styles.TitleText }}>
              Create your new <br /> account
            </Typography>
          </div>
          <div className={styles.CenterBox}>
            <div className={styles.Margin}>
              <FormControl variant="outlined">
                <InputLabel classes={{ root: styles.FormLabel }}>Username</InputLabel>
                <OutlinedInput
                  classes={{
                    root: styles.InputField,
                    notchedOutline: styles.InputField,
                    input: styles.Input,
                  }}
                  data-testid="username"
                  error={userNameError}
                  id="username"
                  label="Username"
                  type="text"
                  value={userName}
                  onChange={handleUserNameChange()}
                />
                {userNameError ? (
                  <FormHelperText classes={{ root: styles.FormHelperText }}>
                    Invalid username.
                  </FormHelperText>
                ) : null}
              </FormControl>
            </div>
            <div className={styles.Margin}>
              <FormControl variant="outlined">
                <InputLabel classes={{ root: styles.FormLabel }}>Your phone number</InputLabel>
                <OutlinedInput
                  classes={{
                    root: styles.InputField,
                    notchedOutline: styles.InputField,
                    input: styles.Input,
                  }}
                  data-testid="phoneNumber"
                  error={phoneNumberError}
                  id="phone-number"
                  label="Your phone number"
                  type="integer"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange()}
                />
                {phoneNumberError ? (
                  <FormHelperText classes={{ root: styles.FormHelperText }}>
                    Invalid phone number.
                  </FormHelperText>
                ) : null}
              </FormControl>
            </div>
            <div className={styles.Margin}>
              <FormControl variant="outlined">
                <InputLabel classes={{ root: styles.FormLabel }}>Password</InputLabel>
                <OutlinedInput
                  classes={{
                    root: styles.InputField,
                    notchedOutline: styles.InputField,
                    input: styles.Input,
                  }}
                  data-testid="password"
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
                        {showPassword ? (
                          <Visibility classes={{ root: styles.IconButton }} />
                        ) : (
                          <VisibilityOff classes={{ root: styles.IconButton }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                />

                {passwordError ? (
                  <FormHelperText classes={{ root: styles.FormHelperText }}>
                    Invalid password, must be at least 8 characters.
                  </FormHelperText>
                ) : null}
              </FormControl>
            </div>
            {errorMessage && !userNameError && !passwordError && !phoneNumberError ? (
              <div className={styles.ErrorMessage}>{errorMessage}</div>
            ) : null}
            <Button
              data-testid="registrationButton"
              onClick={handleSubmit}
              color="primary"
              variant={'contained'}
              className={styles.ContinueButton}
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
