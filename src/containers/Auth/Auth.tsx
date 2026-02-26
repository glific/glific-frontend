import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Typography } from '@mui/material';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Captcha } from 'components/UI/Form/Captcha/Captcha';

import WhatsAppIcon from 'assets/images/icons/Social/Whatsapp.svg?react';
import { Button } from 'components/UI/Form/Button/Button';
import GlificLogo from 'assets/images/logo/Logo.svg';
import styles from './Auth.module.css';
import axios from 'axios';
import { ORGANIZATION_NAME } from 'config';
import setLogs from 'config/logs';
import { checkOrgStatus } from 'services/AuthService';
import { TERMS_OF_USE_LINK } from 'common/constants';

import { Promotion } from './Promotion/Promotion';

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
  loading?: boolean;
  inlineSuccessMessage?: string;
}

export const Auth = ({
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
  loading: externalLoading,
  inlineSuccessMessage,
}: AuthProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [orgName, setOrgName] = useState('Glific');
  const [status, setStatus] = useState('');

  const isLoading = externalLoading !== undefined ? externalLoading : loading;

  useEffect(() => {
    if (mode === 'trialregistration') {
      return;
    }

    axios
      .post(ORGANIZATION_NAME)
      .then(({ data }) => {
        setOrgName(data?.data?.name);
        setStatus(data?.data?.status);
      })
      .catch((error) => setLogs(`orgName error ${JSON.stringify(error)}`, error));
  }, [mode]);

  useEffect(() => {
    if (loading && errorMessage) {
      setLoading(false);
    }
  }, [loading, errorMessage]);

  useEffect(() => {
    checkOrgStatus(status);
  }, [status]);

  const boxClass = [styles.Box];
  const boxTitleClass = [styles.BoxTitle];
  let buttonClass = styles.AuthButton;
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
      buttonClass = styles.AuthRegistrationButton;
      break;
    case 'trialregistration':
      boxClass.push(styles.RegistrationBox);
      boxClass.push(styles.TrialRegistrationBox);
      boxTitleClass.push(styles.RegistrationBoxTitle);
      buttonClass = styles.AuthButton;
      buttonContainedVariant = true;
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
    default:
      break;
  }

  const isRegistration = mode === 'registration';
  const isTrialRegistration = mode === 'trialregistration';
  const whatsAppIcon = <WhatsAppIcon className={styles.WhatsAppIcon} />;
  const otpMessage = 'You will receive an OTP on your WhatsApp number';

  let displayErrorMessage: any = null;
  if (errorMessage) {
    displayErrorMessage = <div className={styles.ErrorMessage}>{errorMessage}</div>;
  }

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordFieldAdditionalInfo = {
    endAdornmentCallback: handlePasswordVisibility,
    togglePassword: showPassword,
  };

  const handlePhone =
    () =>
    (value: string): void => {
      initialFormValues.phone = value;
    };

  let formElements;
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
          {({ submitForm, values, setValues }) => (
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
                  const key = index;

                  return (
                    <div className={field.styles} key={key}>
                      {field.label ? (
                        <Typography data-testid="formLabel" variant="h5" className={styles.FieldLabel}>
                          {field.label}
                        </Typography>
                      ) : (
                        <div className={styles.Spacing} />
                      )}
                      <Field {...fieldInfo} />
                    </div>
                  );
                })}

                {isTrialRegistration && inlineSuccessMessage && (
                  <div className={styles.SuccessMessageInline}>{inlineSuccessMessage}</div>
                )}

                {linkURL && (
                  <div className={styles.Link}>
                    <Link to={`/${linkURL}`}>{linkText}</Link>
                  </div>
                )}

                <div className={styles.CenterButton}>
                  {isRegistration ? (
                    <Captcha
                      component={Button}
                      variant="contained"
                      color="primary"
                      onClick={async (token: string) => {
                        if (token) {
                          // Set captcha value
                          await setValues({ ...values, captcha: token });

                          // Give React time to process the state update
                          await new Promise((resolve) => setTimeout(resolve, 0));

                          // Let Formik handle validation & submission
                          submitForm();
                        }
                      }}
                      className={buttonClass}
                      data-testid="SubmitButton"
                      loading={isLoading}
                      action="register"
                    >
                      {buttonText}
                      {whatsAppIcon}
                    </Captcha>
                  ) : (
                    <Button
                      variant={buttonContainedVariant ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={submitForm}
                      className={buttonClass}
                      data-testid="SubmitButton"
                      loading={isLoading}
                      type="button"
                    >
                      {buttonText}
                    </Button>
                  )}
                </div>
                {isRegistration && <div className={styles.InformationText}>{otpMessage}</div>}
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
    <div
      className={`${styles.Container} ${isTrialRegistration ? styles.TrialContainer : ''}`}
      data-testid="AuthContainer"
    >
      <div className={styles.Auth}>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>
        <hr className={styles.Break} />

        {!isTrialRegistration && <div className={styles.OrganizationName}>{orgName}</div>}

        <div className={boxClass.join(' ')}>
          {formElements}
          {isRegistration && (
            <div className={styles.TermsOfUse}>
              <a href={TERMS_OF_USE_LINK} target="_blank" rel="noreferrer">
                Read the applied terms of use
              </a>
            </div>
          )}
        </div>

        {alternateText ? (
          <>
            <div className={styles.Or}>
              <hr />
              <div className={styles.OrText}>{t('or')}</div>
              <hr />
            </div>
            <Link to={`/${alternateLink}`}>
              <div className={styles.AlternateText}>{alternateText}</div>
            </Link>
          </>
        ) : null}
      </div>

      {mode === 'login' && <Promotion />}
    </div>
  );
};
