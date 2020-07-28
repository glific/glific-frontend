import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import Auth from '../Auth';
import { Formik, Form, Field } from 'formik';
import styles from './ResetPasswordConfirmOTP.module.css';
import { RESET_PASSWORD } from '../../../common/constants';
import axios from 'axios';

export interface ResetPasswordConfirmOTPProps {
  location: any;
}

export const ResetPasswordConfirmOTP: React.SFC<ResetPasswordConfirmOTPProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [OTP, setOTP] = useState('');
  const [newPass, setNewPass] = useState('');
  const [redirect, setRedirect] = useState(false);

  const handlerSubmit = () => {
    axios
      .post(RESET_PASSWORD, {
        user: {
          phone: props.location.state.phoneNumber,
          password: newPass,
          otp: OTP,
        },
      })
      .then((response) => {
        console.log(response);
        setRedirect(true);
      });
  };

  const handleOTPChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setOTP(event.target.value);
  };

  const handleNewPassChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPass(event.target.value);
  };

  if (redirect) {
    return <Redirect to="/chat" />;
  }

  return (
    <Auth
      pageTitle={'Reset your password'}
      buttonText={'SAVE'}
      alternateLink={'login'}
      alternateText={'GO TO LOGIN'}
      handlerSubmitCallback={handlerSubmit}
      mode={'login'}
    >
      <Formik
        initialValues={{ phoneNumber: props.location.state.phoneNumber }}
        onSubmit={(item) => {
          console.log(item);
        }}
      >
        {({ submitForm }) => (
          <Form>
            <div className={styles.CenterForm}>
              Phone Number
              <Field
                disabled
                className={styles.Form}
                type="phone number"
                name="phone number"
              ></Field>
              OTP
              <Field
                className={styles.Form}
                type="OTP"
                name="OTP"
                onChange={handleOTPChange()}
              ></Field>
              New Password
              <Field
                className={styles.Form}
                type="phone number"
                name="phone number"
                onChange={handleNewPassChange()}
              ></Field>
            </div>
          </Form>
        )}
      </Formik>
    </Auth>
  );
};
