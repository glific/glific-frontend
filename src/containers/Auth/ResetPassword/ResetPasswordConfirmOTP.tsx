import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import Auth from '../Auth';
import { Formik, Field } from 'formik';
import styles from '../Auth.module.css';
import { RESET_PASSWORD } from '../../../common/constants';
import axios from 'axios';
import * as Yup from 'yup';
import { Input } from '../../../components/UI/Form/Input/Input';

export interface ResetPasswordConfirmOTPProps {
  location: any;
}

export const ResetPasswordConfirmOTP: React.SFC<ResetPasswordConfirmOTPProps> = (props) => {
  const [redirect, setRedirect] = useState(false);
  const [OTPError, setOTPError] = useState('');

  if (redirect) {
    return <Redirect to="/chat" />;
  }

  const handlerSubmit = () => {
    console.log('hi');
  };

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required('Input required'),
    password: Yup.string()
      .min(6, 'Password must be at least 8 characters long.')
      .required('Input required'),
  });

  const formFields = [
    {
      component: Input,
      name: 'phoneNumber',
      placeholder: 'Phone number',
    },
    {
      component: Input,
      name: 'OTP',
      placeholder: 'OTP',
    },
    {
      component: Input,
      name: 'password',
      placeholder: 'New Password',
    },
  ];

  return (
    <Auth
      pageTitle={'Reset your password'}
      buttonText={'SAVE'}
      alternateLink={'login'}
      alternateText={'GO TO LOGIN'}
      handlerSubmitCallback={handlerSubmit}
      mode={'secondreset'}
      formFields={formFields}
    >
      <div>
        <div className={styles.SubText}>Please create a new password for your account</div>
        <Formik
          initialValues={{ phoneNumber: props.location.state.phoneNumber, OTP: '', password: '' }}
          validationSchema={FormSchema}
          validateOnChange={false}
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
              })
              .catch((error) => setOTPError('Sorry, we are unable to reset your password.'));
          }}
        >
          {({ handleSubmit, errors, touched }) => (
            <form onSubmit={handleSubmit}>
              <div className={styles.CenterForm}>
                <Field
                  disabled
                  className={styles.FormMargin}
                  placeholder={props.location.state.phoneNumber}
                  name="phoneNumber"
                />
                <Field
                  className={errors.OTP ? styles.Form : styles.FormMargin}
                  placeholder="OTP"
                  name="OTP"
                ></Field>
                {errors.OTP && touched.OTP ? (
                  <div className={styles.ErrorMessage}>{errors.OTP}</div>
                ) : null}
                <Field
                  className={styles.Form}
                  type="text"
                  name="password"
                  placeholder="New Password"
                />
                {errors.password && touched.password ? (
                  <div className={styles.ErrorMessage}>{errors.password}</div>
                ) : null}
                {OTPError ? <div className={styles.ErrorSubmit}>{OTPError}</div> : null}
                <button className={styles.WhiteButton} type="submit">
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
