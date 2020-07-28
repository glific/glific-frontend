import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import Auth from '../Auth';
import { Formik, Form, Field } from 'formik';
import styles from './ResetPasswordPhone.module.css';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';
import axios from 'axios';

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
      mode={'login'}
    >
      <div className={styles.Subtext}>Please create a new password for your account</div>
      <Formik
        initialValues={{ phoneNumber: '' }}
        onSubmit={(item) => {
          console.log(item);
        }}
      >
        {({ submitForm }) => (
          <Form>
            <div className={styles.CenterForm}>
              Phone
              <Field
                className={styles.Form}
                type="phone number"
                name="phone number"
                onChange={handlePhoneChange()}
              ></Field>
            </div>
          </Form>
        )}
      </Formik>
    </Auth>
  );
};
