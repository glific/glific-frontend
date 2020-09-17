import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import styles from './Auth.module.css';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { Button } from '../../components/UI/Form/Button/Button';

export interface AuthProps {
  pageTitle: string;
  buttonText: string;
  alternateLink?: string;
  alternateText?: string;
  mode: string;
  initialFormValues?: any;
  saveHandler?: any;
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
  successMessage?: string;
}

export const Auth: React.SFC<AuthProps> = ({
  pageTitle,
  buttonText,
  alternateLink,
  alternateText,
  mode,
  initialFormValues = null,
  saveHandler,
  formFields,
  validationSchema,
  titleSubText,
  linkText,
  linkURL,
  errorMessage,
  successMessage,
}) => {
  // handle visibility for the password field
  const [showPassword, setShowPassword] = useState(false);
  const boxClass = [styles.Box];
  const boxTitleClass = [styles.BoxTitle];
  let buttonContainedVariant = true;
  switch (mode) {
    case 'login':
      boxClass.push(styles.LoginBox);
      boxTitleClass.push(styles.LoginBoxTitle);
      buttonContainedVariant = false;
      break;
    case 'registration':
      boxClass.push(styles.RegistrationBox);
      boxTitleClass.push(styles.RegistrationBoxTitle);
      break;
    case 'confirmotp':
      boxClass.push(styles.OTPBox);
      boxTitleClass.push(styles.RegistrationBoxTitle);
      break;
    case 'firstreset':
      boxClass.push(styles.FirstResetBox);
      boxTitleClass.push(styles.LoginBoxTitle);
      buttonContainedVariant = false;
      break;
    case 'secondreset':
      boxClass.push(styles.SecondResetBox);
      boxTitleClass.push(styles.LoginBoxTitle);
      buttonContainedVariant = false;
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
    endAdornmentCallback: handlePasswordVisibility,
    togglePassword: showPassword,
  };

  const handlePhone = () => (value: string): void => {
    initialFormValues['phone'] = value;
  };

  let formElements;
  // we should not render form elements when displaying success message
  if (!successMessage) {
    formElements = (
      <>
        <div className={boxTitleClass.join(' ')}>
          <Typography variant="h4" classes={{ root: styles.TitleText }}>
            {pageTitle}
          </Typography>
        </div>
        <div className={styles.SubText}>{titleSubText}</div>

        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={(item) => {
            saveHandler(item);
          }}
        >
          {({ submitForm }) => (
            <div className={styles.CenterBox}>
              <Form className={styles.Form}>
                {formFields.map((field, index) => {
                  let fieldInfo = { ...field };
                  if (field.type === 'password') {
                    fieldInfo = { ...field, ...passwordFieldAdditionalInfo };
                  }
                  if (field.type === 'phone') {
                    fieldInfo = { ...field, handlePhone };
                  }
                  return <Field className={styles.Form} key={index} {...fieldInfo} />;
                })}

                <div className={styles.Link}>
                  <Link to={'/' + linkURL}>{linkText} </Link>
                </div>
                <div className={styles.CenterButton}>
                  <Button
                    variant={buttonContainedVariant ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={submitForm}
                    className={styles.AuthButton}
                    data-testid="SubmitButton"
                  >
                    {buttonText}
                  </Button>
                </div>
              </Form>
              {displayErrorMessage}
            </div>
          )}
        </Formik>
      </>
    );
  } else {
    formElements = <div className={styles.SuccessMessage}>{successMessage}</div>;
  }

  return (
    <div className={styles.Container} data-testid="AuthContainer">
      <div className={styles.Auth}>
        <div className={styles.GlificLogo}>Glific</div>
        <div className={boxClass.join(' ')}>{formElements}</div>
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
