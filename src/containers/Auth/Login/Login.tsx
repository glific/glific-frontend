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
import { Formik, Form, Field } from 'formik';
import clsx from 'clsx';
import axios from 'axios';
import { Link } from 'react-router-dom';

import styles from './Login.module.css';
import { USER_SESSION } from '../../../common/constants';
import { SessionContext } from '../../../context/session';
import Auth from '../Auth';

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
      <Formik
        initialValues={{ phoneNumber: '', password: '' }}
        onSubmit={(values, { setSubmitting }) => {
          console.log(values.phoneNumber);
          setPhoneNumber(values.phoneNumber);
          setTimeout(() => {
            setSubmitting(false);
          }, 400);
          axios
            .post(USER_SESSION, {
              user: {
                phone: values.phoneNumber,
                password: values.password,
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
        }}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <div className={styles.CenterForm}>
              <Field
                className={styles.Form}
                name="phoneNumber"
                placeholder="Your phone number"
              ></Field>
              <Field className={styles.Form} name="password" placeholder="Password"></Field>
              <Link to="/resetpassword-phone">
                <div className={styles.ForgotPassword}>Forgot Password?</div>
              </Link>
              <button className={styles.Button} type="submit">
                <div className={styles.ButtonText}>LOGIN</div>
              </button>
            </div>
          </form>
        )}
      </Formik>

      {invalidLogin ? <div className={styles.Errors}>Incorrect username or password.</div> : null}
    </Auth>
  );
};

export default Login;
