import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

import styles from './Organization.module.css';
import { Button } from '../../components/UI/Form/Button/Button';
import GlificLogo from '../../assets/images/logo/Logo.svg';

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
  linkText?: string;
  linkURL?: string;
  errorMessage?: string;
  successMessage?: string;
}

export const Organization: React.SFC<OrganizationProps> = (props) => {
  const {
    pageTitle,
    buttonText,
    initialFormValues = null,
    saveHandler,
    formFields,
    validationSchema,
    titleSubText,
    linkText,
    linkURL,
    errorMessage,
    successMessage,
  } = props;

  const [loading, setLoading] = useState(false);
  const boxClass = [styles.Box, styles.RegistrationBox];
  const boxTitleClass = [styles.BoxTitle, styles.RegistrationBoxTitle];
  const buttonContainedVariant = true;

  let displayErrorMessage: any = null;
  if (errorMessage) {
    displayErrorMessage = <div className={styles.ErrorMessage}>{errorMessage}</div>;
  }

  // Stop loading if any error
  if (loading && displayErrorMessage) setLoading(false);

  const handlePhone = () => (value: string): void => {
    initialFormValues.phone = value;
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
            setLoading(true);
            saveHandler(item);
          }}
        >
          {({ submitForm }) => (
            <div className={styles.CenterBox}>
              <Form className={styles.Form}>
                {formFields.map((field, index) => {
                  let fieldInfo = { ...field };
                  if (field.type === 'phone') {
                    fieldInfo = { ...field, handlePhone };
                  }
                  const key = index;
                  return <Field className={styles.Form} key={key} {...fieldInfo} />;
                })}
                <div className={styles.Link}>
                  <Link to={`/${linkURL}`}>{linkText}</Link>
                </div>
                <div className={styles.CenterButton}>
                  <Button
                    variant={buttonContainedVariant ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={submitForm}
                    className={styles.OrgButton}
                    data-testid="SubmitButton"
                    loading={loading}
                  >
                    {loading ? null : buttonText}
                  </Button>
                </div>
                {/* We neeed to add this submit button to enable form sumbitting when user hits enter
                key. This is an workaround solution till the bug in formik or react is fixed. For
                more info: https://github.com/formium/formik/issues/1418 */}
                <input className={styles.SubmitAction} type="submit" />
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
      <div className={styles.Organization}>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>
        <div className={boxClass.join(' ')}>{formElements}</div>
      </div>
    </div>
  );
};
