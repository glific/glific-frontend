import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Typography } from '@material-ui/core';

import { Captcha } from 'components/UI/Form/Captcha/Captcha';
import { TERMS_OF_USE_LINK } from 'common/constants';
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
  const boxClass = [styles.Box, styles.RegistrationBox];
  const boxTitleClass = [styles.BoxTitle, styles.RegistrationBoxTitle];

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
          saveHandler(item, setErrors, setLoading);
        }}
      >
        {({ submitForm, setFieldValue, values }) => (
          <div className={styles.CenterBox}>
            <Form className={styles.Form}>
              {formFields.map((field: any, index: number) => {
                const key = index;
                return <Field className={styles.Form} key={key} {...field} />;
              })}
              <div className={styles.CenterButton}>
                <Captcha
                  variant="contained"
                  color="primary"
                  onClick={submitForm}
                  className={styles.OrgButton}
                  data-testid="captcha-button"
                  loading={loading}
                  onTokenUpdate={(token: string) => {
                    setFieldValue('token', token);
                  }}
                  disabled={!values.token}
                  action="organization_registration"
                >
                  {loading ? null : buttonText}
                </Captcha>
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
