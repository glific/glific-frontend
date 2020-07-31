import React, { useState, useContext } from 'react';
import { FormHelperText } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import clsx from 'clsx';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { Redirect } from 'react-router-dom';

import {
  REACT_APP_GLIFIC_REGISTRATION_API,
  REACT_APP_GLIFIC_AUTHENTICATION_API,
} from '../../../common/constants';
import { SessionContext } from '../../../context/session';
import styles from './ConfirmOTP.module.css';
import Auth from '../Auth';

export interface ConfirmOTPProps {
  location: any;
}

export const ConfirmOTP: React.SFC<ConfirmOTPProps> = (props) => {
  const { setAuthenticated } = useContext(SessionContext);
  const [userAuthCode, setUserAuthCode] = useState('');
  const [tokenResponse, setTokenResponse] = useState('');
  const [authError, setAuthError] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const handleuserAuthCodeChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAuthCode(event.target.value);
  };

  const handleResend = () => {
    axios
      .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
        user: {
          phone: props.location.state.phoneNumber,
        },
      })
      .then((response: any) => {
        console.log(response);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const handleSubmit = () => {
    if (userAuthCode.length < 6) {
      setAuthError(true);
    } else {
      axios
        .post(REACT_APP_GLIFIC_REGISTRATION_API, {
          user: {
            name: props.location.state.name,
            phone: props.location.state.phoneNumber,
            password: props.location.state.password,
            otp: userAuthCode,
          },
        })
        .then(function (response: any) {
          const responseString = JSON.stringify(response.data.data);
          localStorage.setItem('session', responseString);
          setAuthenticated(true);
          setTokenResponse(responseString);
        })
        .catch(function (error: any) {
          if (error.response.data.error.errors.phone === 'has already been taken') {
            setAlreadyExists(true);
          } else if (error.response.data.error.errors === 'does_not_exist') {
            setAuthError(true);
          }
        });
    }
  };

  // Let's not allow direct navigation to this page
  if (props.location && props.location.state === undefined) {
    return <Redirect to={'/registration'} />;
  }

  if (tokenResponse) {
    return (
      <Redirect
        to={{
          pathname: '/chat',
          state: {
            tokens: tokenResponse,
          },
        }}
      />
    );
  }

  return (
    <Auth
      pageTitle={'Create your new account'}
      buttonText={'CONTINUE'}
      handlerSubmitCallback={handleSubmit}
      mode={'confirmotp'}
    >
      <div className={clsx(styles.Margin, styles.BottomMargin)}>
        <Formik
          initialValues={{ OTP: '' }}
          onSubmit={(values, { setSubmitting }) => {
            console.log(values.OTP);
            setTimeout(() => {
              setSubmitting(false);
            }, 400);
            axios
              .post(REACT_APP_GLIFIC_REGISTRATION_API, {
                user: {
                  name: props.location.state.name,
                  phone: props.location.state.phoneNumber,
                  password: props.location.state.password,
                  otp: values.OTP,
                },
              })
              .then(function (response: any) {
                const responseString = JSON.stringify(response.data.data);
                localStorage.setItem('session', responseString);
                setAuthenticated(true);
                setTokenResponse(responseString);
              })
              .catch(function (error: any) {
                if (error.response.data.error.errors.phone === 'has already been taken') {
                  setAlreadyExists(true);
                } else if (error.response.data.error.errors === 'does_not_exist') {
                  setAuthError(true);
                }
              });
          }}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className={styles.CenterForm}>
                <Field className={styles.Form} name="OTP" placeholder="OTP"></Field>
                <button className={styles.Button} type="submit">
                  <div className={styles.ButtonText}>CONTINUE</div>
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </Auth>
  );
};

export default ConfirmOTP;
