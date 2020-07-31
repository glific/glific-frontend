import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import Auth from '../Auth';
import { Formik, Form, Field } from 'formik';
import styles from './ResetPasswordPhone.module.css';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';
import axios from 'axios';
import { Button } from '../../../components/UI/Form/Button/Button';
import { ValuesOfCorrectTypeRule } from 'graphql';

export interface ResetPasswordPhoneProps {}

export const ResetPasswordPhone: React.SFC<ResetPasswordPhoneProps> = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [redirect, setRedirect] = useState(false);

  const handlerSubmit = () => {
    console.log(phoneNumber);
    axios
      .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
        user: {
          phone: phoneNumber,
          registration: 'false',
        },
      })
      .then((response) => {
        console.log(response);
        setRedirect(true);
      });
  };

  const handlePhoneChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  if (redirect) {
    return (
      <Redirect
        to={{
          pathname: '/resetpassword-confirmotp',
          state: {
            phoneNumber: phoneNumber,
          },
        }}
      />
    );
  }

  return (
    <Auth
      pageTitle={'Reset your password'}
      buttonText={'GENERATE OTP TO CONFIRM'}
      alternateLink={'login'}
      alternateText={'GO TO LOGIN'}
      handlerSubmitCallback={handlerSubmit}
      mode={'firstreset'}
    >
      <div>
        <div className={styles.SubText}>Please create a new password for your account</div>
        <Formik
          initialValues={{ phoneNumber: '' }}
          onSubmit={(values, { setSubmitting }) => {
            console.log(values.phoneNumber);
            setPhoneNumber(values.phoneNumber);
            setTimeout(() => {
              setSubmitting(false);
            }, 400);
            axios
              .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
                user: {
                  phone: values.phoneNumber,
                  registration: 'false',
                },
              })
              .then((response) => {
                console.log(response);
                setRedirect(true);
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
                <button className={styles.Button} type="submit">
                  <div className={styles.ButtonText}>GENERATE OTP TO CONFIRM</div>
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </Auth>
  );
};
