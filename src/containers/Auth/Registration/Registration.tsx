import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { Input } from '../../../components/UI/Form/Input/Input';

import styles from '../Auth.module.css';
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
  const [errorMessage, setErrorMessage] = useState(false);

  const handlerSubmit = () => {
    console.log('hi');
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

  const formFields = [
    {
      component: Input,
      name: 'userName',
      type: 'text',
      placeholder: 'Username',
    },
    {
      component: Input,
      name: 'phoneNumber',
      type: 'text',
      placeholder: 'Phone number',
    },
    {
      component: Input,
      name: 'password',
      placeholder: 'Password',
    },
  ];

  const states = { userName, phoneNumber, password };
  const setStates = ({ userName, phoneNumber, password }: any) => {
    setUserName(userName);
    setPhoneNumber(phoneNumber);
    setPassword(password);
  };

  const FormSchema = Yup.object().shape({
    userName: Yup.string().required('Input required'),
    phoneNumber: Yup.string()
      .required('Input required')
      .min(11, 'Please enter a valid phone number.'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters long.')
      .required('Input required'),
  });

  return (
    <Auth
      pageTitle={'Create your new account'}
      buttonText={'CONTINUE'}
      alternateLink={'login'}
      alternateText={'LOGIN TO GLIFIC'}
      handlerSubmitCallback={handlerSubmit}
      mode={'registration'}
      formFields={formFields}
      setStates={setStates}
      states={states}
    >
      {/* <div className={styles.Margin}>
        <Formik
          initialValues={{ userName: '', phoneNumber: '', password: '' }}
          validationSchema={FormSchema}
          validateOnChange={false}
          validateOnBlur={false}
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
                setErrorMessage(true);
              });
          }}
        >
          {({ handleSubmit, values, errors, touched }) => (
            <form onSubmit={handleSubmit}>
              <div className={styles.CenterForm}>
                <Field
                  className={errors.userName ? styles.Form : styles.FormMargin}
                  name="userName"
                  placeholder="Username"
                />
                {errors.userName && touched.userName ? (
                  <div className={styles.ErrorMessage}>{errors.userName}</div>
                ) : null}
                <Field
                  className={errors.phoneNumber ? styles.Form : styles.FormMargin}
                  name="phoneNumber"
                  placeholder="Your phone number"
                />
                {errors.phoneNumber && touched.phoneNumber ? (
                  <div className={styles.ErrorMessage}>{errors.phoneNumber}</div>
                ) : null}
                <Field
                  className={styles.Form}
                  name="password"
                  placeholder="Password"
                  type={values.password ? 'text' : 'password'}
                />
                {errors.password && touched.password ? (
                  <div className={styles.ErrorMessage}>{errors.password}</div>
                ) : null}
                {errorMessage ? (
                  <div className={styles.ErrorSubmit}>
                    We are unable to create an account, <br /> kindly contact your technicaly team.
                  </div>
                ) : null}
                <button
                  className={errorMessage ? styles.ErrorGreenButtonSubmit : styles.GreenButton}
                  type="submit"
                >
                  <div className={styles.ButtonText}>CONTINUE</div>
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div> */}
    </Auth>
  );
};

export default Registration;
