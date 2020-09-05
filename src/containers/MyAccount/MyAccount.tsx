import React, { useState } from 'react';
import * as Yup from 'yup';
import { Typography, IconButton } from '@material-ui/core';
import { Formik, Form, Field } from 'formik';
import { useQuery, useMutation, ApolloError } from '@apollo/client';

import styles from './MyAccount.module.css';
import { Input } from '../../components/UI/Form/Input/Input';
import { ReactComponent as UserIcon } from '../../assets/images/icons/Contact/Profile.svg';
import { UPDATE_CURRENT_USER } from '../../graphql/mutations/User';
import { GET_CURRENT_USER } from '../../graphql/queries/User';
import { Button } from '../../components/UI/Form/Button/Button';
import Loading from '../../components/UI/Layout/Loading/Loading';
import { sendOTP } from '../../services/AuthService';
import { setNotification } from '../../common/notification';
import { ToastMessage } from '../../components/UI/ToastMessage/ToastMessage';

export interface MyAccountProps {}

export const MyAccount: React.SFC<MyAccountProps> = () => {
  // set the validation / errors / success message
  const [toastMessageInfo, setToastMessageInfo] = useState({ message: '', severity: '' });

  // get the information on current user
  const { data: userData, loading: userDataLoading, client } = useQuery(GET_CURRENT_USER);

  const [updateCurrentUser] = useMutation(UPDATE_CURRENT_USER, {
    onCompleted: (data) => {
      if (data['updateCurrentUser'].errors) {
        if (data['updateCurrentUser'].errors[0]['message'] === 'incorrect_code') {
          setToastMessageInfo({ severity: 'error', message: 'Please enter a valid OTP' });
        } else {
          setToastMessageInfo({
            severity: 'error',
            message: 'Too many attempts, please retry after sometime.',
          });
        }
      } else {
        setShowOTPButton(true);
        setToastMessageInfo({ severity: 'success', message: 'Password updated successfully!' });
      }
    },
  });

  const [showOTPButton, setShowOTPButton] = useState(true);

  if (userDataLoading) return <Loading />;

  const loggedInUserPhone = userData.currentUser.user.phone;

  // send otp to the logged user
  const sendOTPHandler = () => {
    sendOTP(loggedInUserPhone)
      .then((response) => {
        setShowOTPButton(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const cancelHandler = () => {
    setShowOTPButton(true);
  };

  const saveHandler = (item: any) => {
    updateCurrentUser({
      variables: { input: item },
    });
  };

  //toast
  const closeToastMessage = () => {};

  let displayToastMessage: any;
  if (toastMessageInfo.message.length > 0) {
    displayToastMessage = (
      <ToastMessage
        message={toastMessageInfo.message}
        severity={toastMessageInfo.severity === 'success' ? 'success' : 'error'}
        handleClose={closeToastMessage}
      />
    );
  }

  const FormSchema = Yup.object().shape({
    otp: Yup.string().required('Input required'),
    password: Yup.string()
      .min(6, 'Password must be at least 8 characters long.')
      .required('Input required'),
  });

  const formFields = [
    {
      component: Input,
      type: 'otp',
      name: 'otp',
      placeholder: 'OTP',
      helperText: 'Please confirm the OTP received at your whatsapp number.',
      endAdornmentCallback: sendOTPHandler,
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
        initialValues={{}}
        validationSchema={FormSchema}
        onSubmit={(item) => {
          saveHandler(item);
        }}
      >
        {({ submitForm }) => (
          <Form className={styles.Form}>
            {displayToastMessage}
            {formFieldLayout}
            <div className={styles.Buttons}>
              {showOTPButton ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={sendOTPHandler}
                    className={styles.Button}
                  >
                    Generate OTP
                  </Button>
                  <div className={styles.HelperText}>To change first please generate OTP</div>
                </>
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
      <Typography variant="h6" className={styles.Title}>
        Change Password
      </Typography>
      {form}
    </div>
  );
};
