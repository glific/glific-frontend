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
  const [OTP, setOTP] = useState('');
  const [newPass, setNewPass] = useState('');
  const [redirect, setRedirect] = useState(false);

  if (redirect) {
    return <Redirect to="/chat" />;
  }

  const handlerSubmit = () => {
    console.log('hi');
  };

  return (
    <Auth
      pageTitle={'Reset your password'}
      buttonText={'SAVE'}
      alternateLink={'login'}
      alternateText={'GO TO LOGIN'}
      handlerSubmitCallback={handlerSubmit}
      mode={'secondreset'}
    >
      <div>
        <div className={styles.SubText}>Please create a new password for your account</div>
        <Formik
          initialValues={{ phoneNumber: props.location.state.phoneNumber, OTP: '', password: '' }}
          onSubmit={(values, { setSubmitting }) => {
            console.log(values.phoneNumber);
            setTimeout(() => {
              setSubmitting(false);
            }, 400);
            axios
              .post(RESET_PASSWORD, {
                user: {
                  phone: props.location.state.phoneNumber,
                  password: values.password,
                  otp: values.OTP,
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
                  disabled
                  className={styles.Form}
                  placeholder={props.location.state.phoneNumber}
                  name="phoneNumber"
                ></Field>
                <Field className={styles.Form} placeholder="OTP" name="OTP"></Field>
                <Field
                  className={styles.Form}
                  type="phone number"
                  name="password"
                  placeholder="New Password"
                ></Field>
                <button className={styles.Button} type="submit">
                  <div className={styles.ButtonText}>SAVE</div>
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </Auth>
  );
};
