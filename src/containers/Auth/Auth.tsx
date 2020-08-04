import React from 'react';
import { Formik, Form, Field } from 'formik';
import styles from './Auth.module.css';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

export interface AuthProps {
  // children: any;
  pageTitle: string;
  buttonText: string;
  alternateLink?: string;
  alternateText?: string;
  handlerSubmitCallback: Function;
  mode: string;
  initialFormikValues?: any;
  onFormikSubmit?: any;
  formFields: Array<any>;
  setStates?: any;
  states?: any;
}

const Auth: React.SFC<AuthProps> = ({
  // children,
  pageTitle,
  buttonText,
  alternateLink,
  alternateText,
  handlerSubmitCallback,
  mode,
  initialFormikValues = null,
  onFormikSubmit,
  formFields,
  states,
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
    console.log('hi');
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
          <Formik initialValues={{ states }} onSubmit={submitHandler}>
            {({ submitForm }) => (
              <div className={styles.CenterBox}>
                <Form>
                  {formFields.map((field, index) => {
                    return <Field className={styles.FormMargin} key={index} {...field}></Field>;
                  })}
                  <button className={buttonClass.join('')} type="submit">
                    <div className={styles.ButtonText}>{buttonText}</div>
                  </button>
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
