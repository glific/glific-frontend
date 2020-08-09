import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import styles from './Auth.module.css';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

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
  handleSubmitAPI?: any;
  APIFields?: any;
  validationSchema?: any;
  titleSubText?: string;
  linkText?: string;
  linkURL?: string;
  errorMessage?: string;
}

const Auth: React.SFC<AuthProps> = ({
  pageTitle,
  buttonText,
  alternateLink,
  alternateText,
  mode,
  initialFormikValues = null,
  onFormikSubmit = console.log('hi'),
  formFields,
  validationSchema,
  titleSubText,
  linkText,
  linkURL,
  errorMessage,
}) => {
  // handle visibility for the password field
  const [showPassword, setShowPassword] = useState(false);
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
      buttonClass.push(styles.GreenButton);
      break;
    case 'firstreset':
      boxClass.push(styles.FirstResetBox);
      boxTitleClass.push(styles.LoginBoxTitle);
      buttonClass.push(styles.WhiteButton);
      break;
    case 'secondreset':
      boxClass.push(styles.SecondResetBox);
      boxTitleClass.push(styles.LoginBoxTitle);
      buttonClass.push(styles.WhiteButton);
      break;
  }

  let displayErrorMessage: any = null;
  if (errorMessage) {
    displayErrorMessage = <div className={styles.ErrorMessage}>{errorMessage}</div>;
  }

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // let's add the additonal password field info to the password field to handle
  // visibility of the field
  const passwordFieldAdditionalInfo = {
    handleClickShowPassword: handlePasswordVisibility,
    showPassword: showPassword,
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
          <div className={styles.SubText}>{titleSubText}</div>
          <Formik
            initialValues={initialFormikValues}
            validationSchema={validationSchema}
            onSubmit={(item) => {
              onFormikSubmit(item);
            }}
          >
            {() => (
              <div className={styles.CenterBox}>
                <Form className={styles.Form}>
                  {formFields.map((field, index) => {
                    let fieldInfo = { ...field };
                    if (field.type === 'password') {
                      fieldInfo = { ...field, ...passwordFieldAdditionalInfo };
                    }
                    return <Field className={styles.Form} key={index} {...fieldInfo} />;
                  })}
                  <Link to={'/' + linkURL}>
                    <div className={styles.Link}>{linkText}</div>
                  </Link>
                  <div className={styles.CenterButton}>
                    <button className={buttonClass.join(' ')} type="submit">
                      <div className={styles.ButtonText}>{buttonText}</div>
                    </button>
                  </div>
                </Form>
                {displayErrorMessage}
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
            <Link to={'/' + alternateLink}>
              <div>{alternateText}</div>
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Auth;
