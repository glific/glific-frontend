import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import axios from 'axios';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import styles from '../Auth.module.css';
import { USER_SESSION } from '../../../common/constants';
import { SessionContext } from '../../../context/session';
import Auth from '../Auth';
import { Input } from '../../../components/UI/Form/Input/Input';

export interface LoginProps {}

export const Login: React.SFC<LoginProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [invalidLogin, setInvalidLogin] = useState(false);

  const handleInputErrors = () => {
    let foundErrors = false;
    if (!phoneNumber) {
      setPhoneNumberError(true);
      foundErrors = true;
    } else if (phoneNumber) {
      setPhoneNumberError(false);
    }
    if (!password) {
      setPasswordError(true);
      foundErrors = true;
    } else if (password) {
      setPasswordError(false);
    }
    return foundErrors;
  };

  const handlerSubmit = () => {
    // set invalid login false as it should be set only on server response
    // errors are handled separately for the client side
    setInvalidLogin(false);

    // if errors just return
    if (handleInputErrors()) {
      return;
    }

    // we should call the backend only if frontend has valid input
    if (!passwordError && !phoneNumberError) {
      axios
        .post(USER_SESSION, {
          user: {
            phone: phoneNumber,
            password: password,
          },
        })
        .then((response: any) => {
          const responseString = JSON.stringify(response.data.data);
          localStorage.setItem('session', responseString);
          setAuthenticated(true);
          setSessionToken(responseString);
        })
        .catch((error: any) => {
          setInvalidLogin(true);
        });
    }
  };

  if (sessionToken) {
    return (
      <Redirect
        to={{
          pathname: '/chat',
          state: {
            tokens: sessionToken,
          },
        }}
      />
    );
  }

  const FormSchema = Yup.object().shape({
    phoneNumber: Yup.string().required('Input required'),
    password: Yup.string().required('Input required'),
  });

  const formFields = [
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

  return (
    <Auth
      pageTitle={'Login to your account'}
      buttonText={'LOGIN'}
      alternateLink={'registration'}
      alternateText={'CREATE A NEW ACCOUNT'}
      handlerSubmitCallback={handlerSubmit}
      mode={'login'}
      formFields={formFields}
    >
      <Formik
        initialValues={{ phoneNumber: '', password: '' }}
        validationSchema={FormSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={(values, { setSubmitting }) => {
          console.log(values.phoneNumber);
          setPhoneNumber(values.phoneNumber);
          setTimeout(() => {
            setSubmitting(false);
          }, 400);
          axios
            .post(USER_SESSION, {
              user: {
                phone: values.phoneNumber,
                password: values.password,
              },
            })
            .then((response: any) => {
              const responseString = JSON.stringify(response.data.data);
              localStorage.setItem('session', responseString);
              setAuthenticated(true);
              setSessionToken(responseString);
            })
            .catch((error: any) => {
              setInvalidLogin(true);
            });
        }}
      >
        {({ handleSubmit, errors, touched }) => (
          <form onSubmit={handleSubmit}>
            <div className={styles.CenterForm}>
              <Field
                className={errors.phoneNumber ? styles.Form : styles.FormMargin}
                name="phoneNumber"
                placeholder="Your phone number"
              />
              {errors.phoneNumber && touched.phoneNumber ? (
                <div className={styles.ErrorMessage}>{errors.phoneNumber}</div>
              ) : null}
              <Field className={styles.Form} name="password" placeholder="Password" />
              {errors.password && touched.password ? (
                <div className={styles.ErrorMessage}>{errors.password}</div>
              ) : null}
              <Link to="/resetpassword-phone">
                <div className={styles.ForgotPassword}>Forgot Password?</div>
              </Link>
              {invalidLogin ? (
                <div className={styles.ErrorSubmit}>Incorrect username or password.</div>
              ) : null}
              <button className={styles.WhiteButton} type="submit">
                <div className={styles.ButtonText}>LOGIN</div>
              </button>
            </div>
          </form>
        )}
      </Formik>
    </Auth>
  );
};

export default Login;
