import React, { useState } from 'react';
import * as Yup from 'yup';
import { Typography, IconButton } from '@material-ui/core';
import { Formik, Form, Field } from 'formik';

import styles from './MyAccount.module.css';
import { Input } from '../../components/UI/Form/Input/Input';
import { ReactComponent as UserIcon } from '../../assets/images/icons/Contact/Profile.svg';
import { UPDATE_CURRENT_USER } from '../../graphql/mutations/User';
import { GET_CURRENT_USER } from '../../graphql/queries/User';
import { Button } from '../../components/UI/Form/Button/Button';

export interface MyAccountProps {}

export const MyAccount: React.SFC<MyAccountProps> = () => {
  const [showOTPButton, setShowOTPButton] = useState(true);
  const [password, setPassword] = useState('');

  const resendOTPHandler = () => {};

  // send otp
  const sendOTPHandler = () => {
    setShowOTPButton(false);
  };

  const cancelHandler = () => {};
  const saveHandler = (item: any) => {};

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required('Input required'),
    password: Yup.string()
      .min(6, 'Password must be at least 8 characters long.')
      .required('Input required'),
  });

  const formFields = [
    {
      component: Input,
      type: 'otp',
      name: 'OTP',
      placeholder: 'OTP',
      helperText: 'Please confirm the OTP received at your whatsapp number.',
      endAdornmentCallback: resendOTPHandler,
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: 'Change Password',
    },
  ];

  // form fields
  let formFieldLayout: any;
  if (!showOTPButton) {
    formFieldLayout = formFields.map((field: any, index) => {
      return (
        <React.Fragment key={index}>
          {field.label ? (
            <Typography variant="h5" className={styles.Title}>
              {field.label}
            </Typography>
          ) : null}
          <Field key={index} {...field}></Field>
        </React.Fragment>
      );
    });
  }
  let form = (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          password,
        }}
        validationSchema={FormSchema}
        onSubmit={(item) => {
          console.log('submitted');
          saveHandler(item);
        }}
      >
        {({ submitForm }) => (
          <Form className={styles.Form}>
            {/* {toastMessage} */}
            {formFieldLayout}
            <div className={styles.Buttons}>
              {showOTPButton ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={sendOTPHandler}
                  className={styles.Button}
                >
                  Send OTP
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={submitForm}
                    className={styles.Button}
                  >
                    Save
                  </Button>
                  <Button variant="contained" color="default" onClick={cancelHandler}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </>
  );

  return (
    <div className={styles.MyAccount} data-testid="MyAccount">
      <Typography variant="h5" className={styles.Title}>
        <IconButton disabled={true} className={styles.Icon}>
          <UserIcon />
        </IconButton>
        My Account
      </Typography>
      {form}
    </div>
  );
};
