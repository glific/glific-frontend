import React, { useState, useContext } from 'react';
import clsx from 'clsx';
import axios from 'axios';
import { Formik, Field } from 'formik';
import { Redirect } from 'react-router-dom';
import * as Yup from 'yup';
import {
  REACT_APP_GLIFIC_REGISTRATION_API,
  REACT_APP_GLIFIC_AUTHENTICATION_API,
} from '../../../common/constants';
import { SessionContext } from '../../../context/session';
import styles from '../Auth.module.css';
import Auth from '../Auth';

export interface ConfirmOTPProps {
  location: any;
}

export const ConfirmOTP: React.SFC<ConfirmOTPProps> = (props) => {
  const { setAuthenticated } = useContext(SessionContext);
  const [userAuthCode, setUserAuthCode] = useState('');
  const [tokenResponse, setTokenResponse] = useState('');
  const [authError, setAuthError] = useState('');
  const [alreadyExists, setAlreadyExists] = useState(false);

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
      setAuthError('hi');
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
          setAuthError('hi');
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

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required('Input required'),
  });

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
          validationSchema={FormSchema}
          validateOnChange={false}
          validateOnBlur={false}
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
                  setAuthError('Invalid OTP.');
                }
              });
          }}
        >
          {({ handleSubmit, errors, touched }) => (
            <form onSubmit={handleSubmit}>
              <div className={styles.CenterForm}>
                <Field className={styles.Form} name="OTP" placeholder="OTP" />
                {errors.OTP && touched.OTP ? (
                  <div className={styles.ErrorMessage}>{errors.OTP}</div>
                ) : null}
                {alreadyExists ? (
                  <div>An account with this phone number already exists.</div>
                ) : null}
                {authError ? <div>{authError}</div> : null}
                <button className={styles.GreenButton} type="submit">
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
