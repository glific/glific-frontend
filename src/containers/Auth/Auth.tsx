import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Captcha } from 'components/UI/Form/Captcha/Captcha';

import WhatsAppIcon from 'assets/images/icons/Social/Whatsapp.svg?react';
import { termsOfUse } from 'containers/Organization/Organization';
import { Button } from 'components/UI/Form/Button/Button';
import GlificLogo from 'assets/images/logo/Logo.svg';
// import { Promotion } from './Promotion/Promotion';
import styles from './Auth.module.css';
import axios from 'axios';
import { ORGANIZATION_NAME } from 'config';
import setLogs from 'config/logs';

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
}: AuthProps) => {
  // handle visibility for the password field
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [orgName, setOrgName] = useState('Glific');

  useEffect(() => {
    axios
      .post(ORGANIZATION_NAME)
      .then(({ data }) => setOrgName(data?.data?.name))
      .catch((error) => setLogs(`orgName error ${JSON.stringify(error)}`, error));
  }, []);

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
  const whatsAppIcon = <WhatsAppIcon className={styles.WhatsAppIcon} />;
  const otpMessage = 'You will receive an OTP on your WhatsApp number';
  let displayErrorMessage: any = null;
  if (errorMessage) {
    displayErrorMessage = <div className={styles.ErrorMessage}>{errorMessage}</div>;
  }

  // Stop loading if any error
  if (loading && displayErrorMessage) setLoading(false);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // let's add the additonal password field info to the password field to handle
  // visibility of the field
  const passwordFieldAdditionalInfo = {
    endAdornmentCallback: handlePasswordVisibility,
    togglePassword: showPassword,
  };

  const handlePhone =
    () =>
    (value: string): void => {
      // eslint-disable-next-line
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
          {({ submitForm, setFieldValue, values }) => (
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
                    <div key={key}>
                      {field.label ? (
                        <Typography
                          data-testid="formLabel"
                          variant="h5"
                          className={styles.FieldLabel}
                        >
                          {field.label}
                        </Typography>
                      ) : (
                        <div className={styles.Spacing} />
                      )}
                      <Field {...fieldInfo} />
                    </div>
                  );
                })}
                <div className={styles.Link}>
                  <Link to={`/${linkURL}`}>{linkText}</Link>
                </div>
                <div className={styles.CenterButton}>
                  {isRegistration ? (
                    <Captcha
                      component={Button}
                      variant="contained"
                      color="primary"
                      onClick={submitForm}
                      className={buttonClass}
                      data-testid="SubmitButton"
                      loading={loading}
                      onTokenUpdate={(token: string) => {
                        setFieldValue('captcha', token);
                      }}
                      disabled={!values.captcha}
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
                      loading={loading}
                    >
                      {!loading && buttonText}
                    </Button>
                  )}
                </div>
                {isRegistration && <div className={styles.InformationText}>{otpMessage}</div>}
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
      <div className={styles.Auth}>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>
        <hr className={styles.Break} />

        <div className={styles.OrganizationName}>{orgName}</div>

        <div className={boxClass.join(' ')}>
          {formElements}
          {isRegistration && termsOfUse}
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
      {/* commenting out the promotion section for now */}
      {/* {mode === 'login' && <Promotion />} */}
    </div>
  );
};
