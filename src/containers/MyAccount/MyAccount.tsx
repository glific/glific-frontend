import { useState } from 'react';
import * as Yup from 'yup';
import { Typography } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { UPDATE_CURRENT_USER } from 'graphql/mutations/User';
import { GET_CURRENT_USER } from 'graphql/queries/User';
import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { Input } from 'components/UI/Form/Input/Input';
import { Button } from 'components/UI/Form/Button/Button';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { ToastMessage } from 'components/UI/ToastMessage/ToastMessage';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { sendOTP } from 'services/AuthService';
import { yupPasswordValidation } from 'common/constants';
import styles from './MyAccount.module.css';
import { Heading } from 'components/UI/Heading/Heading';

export const MyAccount = () => {
  // set the validation / errors / success message
  const [toastMessageInfo, setToastMessageInfo] = useState({ message: '', severity: '' });

  // set the trigger to show next step
  const [showOTPButton, setShowOTPButton] = useState(true);

  // handle visibility for the password field
  const [showPassword, setShowPassword] = useState(false);

  // user language selection
  const [userLanguage, setUserLanguage] = useState('');

  const client = useApolloClient();

  // get the information on current user
  const { data: userData, loading: userDataLoading } = useQuery(GET_CURRENT_USER);

  // get available languages for the logged in users organization
  const { data: organizationData, loading: organizationDataLoading } = useQuery(USER_LANGUAGES);

  const { t, i18n } = useTranslation();

  // single mutation hook reused for language change and the security (email/password) save
  const [updateCurrentUser] = useMutation(UPDATE_CURRENT_USER);

  // return loading till we fetch the data
  if (userDataLoading || organizationDataLoading) return <Loading />;

  const userName = userData.currentUser.user.name;
  const userPhone = userData.currentUser.user.phone;
  const userEmail = userData.currentUser.user.email ?? '';
  // filter languages that support localization
  const languageOptions = organizationData.currentUser.user.organization.activeLanguages
    .filter((lang: any) => lang.localized)
    .map((lang: any) => {
      // restructure language array
      const lanObj = { id: lang.locale, label: lang.label };
      return lanObj;
    });

  // callback function to send otp to the logged user
  const sendOTPHandler = () => {
    // set the phone of logged in user that will be used to send the OTP
    const loggedInUserPhone = userData?.currentUser.user.phone;
    sendOTP(loggedInUserPhone)
      .then(() => {
        setShowOTPButton(false);
      })
      .catch(() => {
        setToastMessageInfo({
          severity: 'error',
          message: `Unable to send an OTP to ${loggedInUserPhone}.`,
        });
      });
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // callback function when close icon is clicked
  const closeToastMessage = () => {
    // reset toast information
    setToastMessageInfo({ message: '', severity: '' });
  };

  // set up toast message display, we use this for showing backend validation errors like
  // invalid OTP and also display success message on account update
  let displayToastMessage: any;
  if (toastMessageInfo.message.length > 0) {
    displayToastMessage = (
      <ToastMessage
        message={toastMessageInfo.message}
        severity={toastMessageInfo.severity === 'success' ? 'success' : 'error'}
        handleClose={closeToastMessage}
      />
    );
  }

  const passwordSchema = yupPasswordValidation(t);

  // email + otp are required once the otp field is reachable; password is optional so saving
  // just the email never forces a password change
  const SecurityFormSchema = Yup.object().shape({
    email: Yup.string().email(t('Email is invalid')).required(t('Email is required.')),
    password: Yup.string().test('password-optional', '', function passwordOptional(value) {
      if (!value) return true;
      try {
        passwordSchema.validateSync(value);
        return true;
      } catch (error: any) {
        return this.createError({ message: error.message });
      }
    }),
    otp: Yup.string().required(t('Input required')),
  });

  // save whichever of email/password actually changed, verified by the shared otp
  const securitySubmitHandler = async (values: any, { resetForm }: any) => {
    const input: { otp: string; email: string; password?: string } = {
      otp: values.otp,
      email: values.email,
    };
    if (values.password) {
      input.password = values.password;
    }

    try {
      const response = await updateCurrentUser({ variables: { input } });
      if (response.data?.updateCurrentUser?.errors) {
        const errorMessage = response.data.updateCurrentUser.errors[0].message;
        setToastMessageInfo({
          severity: 'error',
          message: errorMessage === 'incorrect_code' ? t('Please enter a valid OTP') : errorMessage,
        });
      } else {
        setToastMessageInfo({ severity: 'success', message: t('Account updated successfully!') });

        // writing cache to restore value
        const userDataCopy = JSON.parse(JSON.stringify(userData));
        userDataCopy.currentUser.user.email = values.email;
        client.writeQuery({
          query: GET_CURRENT_USER,
          data: userDataCopy,
        });

        resetForm();
        setShowOTPButton(true);
      }
    } catch (error) {
      setToastMessageInfo({ severity: 'error', message: t('Failed to update account.') });
    }
  };

  const cancelSecurityForm = (resetForm: () => void) => {
    resetForm();
    setShowOTPButton(true);
  };

  const profileFields = [
    {
      component: Input,
      name: 'name',
      label: t('Name'),
      disabled: true,
    },
    {
      component: Input,
      name: 'phone',
      label: t('Phone number'),
      disabled: true,
    },
  ];

  const profileForm = (
    <Formik initialValues={{ name: userName, phone: userPhone }} onSubmit={() => {}}>
      <Form>
        {profileFields.map((field) => (
          <div className={styles.UserField} key={field.name}>
            {field.label && (
              <Typography data-testid="formLabel" variant="h5" className={styles.FieldLabel}>
                {field.label}
              </Typography>
            )}
            <Field key={field.name} {...field}></Field>
          </div>
        ))}
      </Form>
    </Formik>
  );

  // set only for the first time
  if (!userLanguage && userData.currentUser.user.language) {
    setUserLanguage(userData.currentUser.user.language.locale);
  }

  const changeLanguage = async (event: any) => {
    setUserLanguage(event.target.value);

    // change the user interface
    i18n.changeLanguage(event.target.value);

    // get language id
    const languageID = organizationData.currentUser.user.organization.activeLanguages.filter(
      (lang: any) => lang.locale === event.target.value
    );

    try {
      await updateCurrentUser({ variables: { input: { languageId: languageID[0].id } } });
      setToastMessageInfo({ severity: 'success', message: t('Language changed successfully!') });

      // writing cache to restore value
      const userDataCopy = JSON.parse(JSON.stringify(userData));
      const language = languageID[0];
      userDataCopy.currentUser.user.language = language;

      client.writeQuery({
        query: GET_CURRENT_USER,
        data: userDataCopy,
      });
    } catch (error) {
      setToastMessageInfo({ severity: 'error', message: t('Failed to update language.') });
    }
  };

  const languageField = {
    onChange: changeLanguage,
    value: userLanguage,
  };

  const languageSwitcher = (
    <div className={styles.Form}>
      <Dropdown options={languageOptions} placeholder={t('Available languages')} field={languageField} />
    </div>
  );

  const securityForm = (
    <Formik
      enableReinitialize
      initialValues={{ email: userEmail, password: '', otp: '' }}
      validationSchema={SecurityFormSchema}
      onSubmit={securitySubmitHandler}
    >
      {({ submitForm, isSubmitting, resetForm }) => (
        <Form className={styles.Form}>
          {displayToastMessage}
          <Typography variant="h6" className={`${styles.FormTitle} ${styles.FirstFormTitle}`}>
            {t('Update Email')}
          </Typography>
          <div className={styles.ChangePasswordField}>
            <Typography data-testid="formLabel" variant="h5" className={styles.FieldLabel}>
              {t('Email')}
            </Typography>
            <Field component={Input} name="email" />
          </div>
          <Typography variant="h6" className={styles.FormTitle}>
            {t('Change Password')}
          </Typography>
          <div className={styles.ChangePasswordField}>
            <Typography data-testid="formLabel" variant="h5" className={styles.FieldLabel}>
              {t('Password')}
            </Typography>
            <Field
              component={Input}
              name="password"
              type="password"
              placeholder={t('Change Password')}
              endAdornmentCallback={handlePasswordVisibility}
              togglePassword={showPassword}
            />
          </div>
          {showOTPButton ? (
            <div className={styles.Buttons}>
              <Button
                variant="contained"
                color="primary"
                onClick={sendOTPHandler}
                className={styles.Button}
                data-testid="generateOTP"
              >
                {t('Generate OTP')}
              </Button>
              <div className={styles.HelperText}>{t('To change first please generate OTP')}</div>
            </div>
          ) : (
            <>
              <div className={styles.ChangePasswordField}>
                <Field
                  component={Input}
                  type="otp"
                  name="otp"
                  placeholder="OTP"
                  helperText={t('Please confirm the OTP received at your WhatsApp number.')}
                  endAdornmentCallback={sendOTPHandler}
                />
              </div>
              <div className={styles.Buttons}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={submitForm}
                  loading={isSubmitting}
                  data-testid="saveButton"
                >
                  {t('Save')}
                </Button>
                <Button variant="contained" onClick={() => cancelSecurityForm(resetForm)} data-testid="cancelButton">
                  {t('Cancel')}
                </Button>
              </div>
            </>
          )}
        </Form>
      )}
    </Formik>
  );

  return (
    <>
      <Heading formTitle={t('My Account')} />
      <div className={styles.MyAccountBody}>
        <div className={styles.MyAccount} data-testid="MyAccount">
          {profileForm}
          <Typography variant="h6" className={styles.Title}>
            {t('Change Interface Language')}
          </Typography>
          {languageSwitcher}
          {securityForm}
        </div>
      </div>
    </>
  );
};

export default MyAccount;
