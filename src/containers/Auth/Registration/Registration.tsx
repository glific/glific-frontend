import React, { useState } from 'react';
import { FormHelperText } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import axios from 'axios';

import styles from './Registration.module.css';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';
import Auth from '../Auth';

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

  const handlerSubmit = () => {
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
          // For now let's set an error message manually till the backend give us nicer messages
          //setErrorMessage(error.response.data.error.message);
          setErrorMessage('We are unable to register, kindly contact your technical team.');
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
    <Auth
      pageTitle={'Create your new account'}
      buttonText={'CONTINUE'}
      alternateLink={'login'}
      alternateText={'LOGIN TO GLIFIC'}
      handlerSubmitCallback={handlerSubmit}
      mode={'registration'}
    >
      <div className={styles.Margin}>
        <Formik
          initialValues={{ userName: '', phoneNumber: '', password: '' }}
          onSubmit={(values, { setSubmitting }) => {
            setPhoneNumber(values.phoneNumber);
            setUserName(values.userName);
            setPassword(values.password);
            setTimeout(() => {
              setSubmitting(false);
            }, 400);
            axios
              .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
                user: {
                  phone: values.phoneNumber,
                },
              })
              .then((response: any) => {
                setAuthMessage(response);
              })
              .catch((error: any) => {
                // For now let's set an error message manually till the backend give us nicer messages
                //setErrorMessage(error.response.data.error.message);
                setErrorMessage('We are unable to register, kindly contact your technical team.');
              });
          }}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className={styles.CenterForm}>
                <Field className={styles.Form} name="userName" placeholder="Username"></Field>
                <Field
                  className={styles.Form}
                  name="phoneNumber"
                  placeholder="Your phone number"
                ></Field>
                <Field className={styles.Form} name="password" placeholder="Password"></Field>
                <button className={styles.Button} type="submit">
                  <div className={styles.ButtonText}>CONTINUE</div>
                </button>
              </div>
            </form>
          )}
        </Formik>
        {/* {errorMessage && !userNameError && !passwordError && !phoneNumberError ? (
          <div className={styles.ErrorMessage}>{errorMessage}</div>
        ) : null} */}
      </div>
    </Auth>
  );
};

export default Registration;
