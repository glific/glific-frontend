import React from 'react';
import { Formik, Form, Field, setNestedObjectValues } from 'formik';
import styles from './Auth.module.css';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import axios from 'axios';

export interface AuthProps {
  // children: any;
  pageTitle: string;
  buttonText: string;
  alternateLink?: string;
  alternateText?: string;
  mode: string;
  initialFormikValues?: any;
  onFormikSubmit?: any;
  formFields: Array<any>;
  setStates?: any;
  states?: any;
  handleSubmit?: any;
  handleSubmitAPI?: any;
  APIFields?: any;
  validationSchema?: any;
}

const Auth: React.SFC<AuthProps> = ({
  children,
  pageTitle,
  buttonText,
  alternateLink,
  alternateText,
  mode,
  initialFormikValues = null,
  onFormikSubmit,
  formFields,
  states,
  handleSubmit = console.log('hi'),
  handleSubmitAPI,
  APIFields,
  validationSchema,
}) => {
  console.log(formFields);
  const boxClass = [styles.Box];
  const boxTitleClass = [styles.BoxTitle];
  const buttonClass = [styles.AuthButton];
  switch (mode) {
    case 'login':
      boxClass.push(styles.LoginBox);
      boxTitleClass.push(styles.LoginBoxTitle);
      buttonClass.push(styles.WhiteButton);
      break;
    case 'registration':
      boxClass.push(styles.RegistrationBox);
      boxTitleClass.push(styles.RegistrationBoxTitle);
      buttonClass.push(styles.GreenButton);
      break;
    case 'confirmotp':
      boxClass.push(styles.OTPBox);
      boxTitleClass.push(styles.RegistrationBoxTitle);
      break;
    case 'firstreset':
      boxClass.push(styles.FirstResetBox);
      boxTitleClass.push(styles.LoginBoxTitle);
      break;
    case 'secondreset':
      boxClass.push(styles.SecondResetBox);
      boxTitleClass.push(styles.LoginBoxTitle);
      break;
  }

  const submitHandler = () => {
    axios.post(handleSubmitAPI);
  };

  return (
    <div className={styles.Container}>
      <div className={styles.Auth}>
        <div className={styles.GlificLogo}>Glific</div>
        <div className={boxClass.join(' ')}>
          <div className={boxTitleClass.join(' ')}>
            <Typography variant="h4" classes={{ root: styles.TitleText }}>
              {pageTitle}
            </Typography>
          </div>
          <Formik
            initialValues={{ states }}
            validateOnChange={false}
            validateOnBlur={false}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              console.log('hi');
              setTimeout(() => {
                setSubmitting(false);
              }, 400);
              submitHandler();
              console.log(values);
            }}
          >
            {({ handleSubmit }) => (
              <div className={styles.CenterBox}>
                <Form className={styles.Form}>
                  {formFields.map((field, index) => {
                    return <Field className={styles.Form} key={index} {...field}></Field>;
                  })}
                  <div className={styles.CenterButton}>
                    <button className={buttonClass.join('')} onClick={handleSubmit()} type="submit">
                      <div className={styles.ButtonText}>{buttonText}</div>
                    </button>
                  </div>
                </Form>
              </div>
            )}
          </Formik>
        </div>
        {alternateText ? (
          <>
            <div className={styles.Or}>
              <hr />
              <div className={styles.OrText}>OR</div>
              <hr />
            </div>
            <div>
              <Link to={'/' + alternateLink}>{alternateText}</Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Auth;
