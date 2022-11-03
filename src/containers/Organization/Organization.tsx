import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Typography } from '@material-ui/core';

import { Captcha } from 'components/UI/Form/Captcha/Captcha';
import { TERMS_OF_USE_LINK } from 'common/constants';
import { Button } from 'components/UI/Form/Button/Button';
import GlificLogo from 'assets/images/logo/Logo.svg';
import styles from './Organization.module.css';

export interface OrganizationProps {
  pageTitle: string;
  buttonText: string;
  initialFormValues?: any;
  saveHandler?: any;
  formFields: Array<any>;
  setStates?: any;
  states?: any;
  handleSubmitAPI?: any;
  APIFields?: any;
  validationSchema?: any;
  titleSubText?: string;
  errorMessage?: any;
}

export const termsOfUse = (
  <div className={styles.TermsOfUse}>
    <a href={TERMS_OF_USE_LINK} target="_blank" rel="noreferrer">
      Read the applied terms of use
    </a>
  </div>
);

export const Organization = ({
  pageTitle,
  buttonText,
  initialFormValues = null,
  saveHandler,
  formFields,
  validationSchema,
  titleSubText,
  errorMessage,
}: OrganizationProps) => {
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const boxClass = [styles.Box, styles.RegistrationBox];
  const boxTitleClass = [styles.BoxTitle, styles.RegistrationBoxTitle];
  const buttonContainedVariant = true;

  let displayErrorMessage: any = null;

  /**
   * Errors other than attribute errors will be
   * displayed under form
   */
  if (errorMessage) {
    displayErrorMessage = <div className={styles.ErrorMessage}>{errorMessage.global}</div>;
  }

  // Stop loading if any error
  if (loading && displayErrorMessage) setLoading(false);

  /**
   *
   * @param value
   * If captcha is successful then value will have callback string
   * else value will be null
   *
   * This callback is called on onExpired so don't need to handle callback for onExpired
   */
  const handleCaptchaChange = (value: any) => {
    setCaptcha(value);
  };

  const handleCaptchaError = () => {
    setCaptcha(null);
  };

  const formElements = (
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
        onSubmit={(item, { setErrors }) => {
          setLoading(true);
          /**
           * SetError and SetLoading is used to set server side messages
           * and toggle loading on and off
           */
          saveHandler(item, captcha, setErrors, setLoading);
          setCaptcha(null);
        }}
      >
        {({ submitForm }) => (
          <div className={styles.CenterBox}>
            <Form className={styles.Form}>
              {formFields.map((field: any, index: number) => {
                const key = index;
                return <Field className={styles.Form} key={key} {...field} />;
              })}
              {!loading && <Captcha onChange={handleCaptchaChange} onError={handleCaptchaError} />}
              <div className={styles.CenterButton}>
                <Button
                  variant={buttonContainedVariant ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={submitForm}
                  className={styles.OrgButton}
                  data-testid="SubmitButton"
                  loading={loading}
                  disabled={!captcha}
                >
                  {loading ? null : buttonText}
                </Button>
              </div>
              <input className={styles.SubmitAction} type="submit" />
            </Form>
            {displayErrorMessage}
            {termsOfUse}
          </div>
        )}
      </Formik>
    </>
  );

  return (
    <div className={styles.Container} data-testid="RegistrationContainer">
      <div className={styles.Organization}>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>
        <div className={boxClass.join(' ')}>{formElements}</div>
      </div>
    </div>
  );
};
