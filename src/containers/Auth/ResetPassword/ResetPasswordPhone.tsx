import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import Auth from '../Auth';
import { Formik, Field } from 'formik';
import styles from '../Auth.module.css';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';
import axios from 'axios';
import * as Yup from 'yup';
import { Input } from '../../../components/UI/Form/Input/Input';

export interface ResetPasswordPhoneProps {}

export const ResetPasswordPhone: React.SFC<ResetPasswordPhoneProps> = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState('');

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required('Input required'),
    phoneNumber: Yup.string()
      .min(11, 'Please enter a valid phone number.')
      .required('Input required'),
  });

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

  const formFields = [
    {
      component: Input,
      name: 'phoneNumber',
      type: 'text',
      placeholder: 'Phone number',
    },
  ];

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
      mode={'firstreset'}
      formFields={formFields}
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
              })
              .catch((error) => setErrorSubmit('Sorry, we are unable to send a code.'));
          }}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className={styles.CenterForm}>
                <Field className={styles.Form} name="phoneNumber" placeholder="Your phone number" />
                {errorSubmit ? <div className={styles.ErrorSubmit}>{errorSubmit}</div> : null}
                <button className={styles.WhiteButton} type="submit">
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
