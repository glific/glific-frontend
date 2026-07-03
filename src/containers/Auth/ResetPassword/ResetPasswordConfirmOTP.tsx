import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import axios from 'axios';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { RESET_PASSWORD } from 'config';
import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { yupPasswordValidation } from 'common/constants';
import { sendOTP } from 'services/AuthService';
import { Auth } from '../Auth';

// Neutral, non-disclosing note: shown to everyone regardless of whether the account exists,
// so a user whose number isn't registered understands why no OTP arrives (and can fix a typo
// in the editable phone field above) without the API ever confirming account existence.
const OTP_INFO_NOTE =
  "If this number is registered, you'll receive an OTP on WhatsApp. Enter it below to reset your password.";
const OTP_INFO_NOTE_TIMEOUT = 15000;
const RESEND_SUCCESS_TIMEOUT = 2000;

export const ResetPasswordConfirmOTP = () => {
  const [redirect, setRedirect] = useState(false);
  const [authError, setAuthError] = useState('');
  // The note area doubles as transient resend feedback: neutral info on load, then a brief
  // success confirmation after a resend. `infoSuccess` switches it to the success (green) style.
  const [infoMessage, setInfoMessage] = useState<string>(OTP_INFO_NOTE);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  // Read the state synchronously so the phone number is prepopulated on the very first render
  // (Formik captures initialValues once, so an async useEffect would leave the field blank).
  const locationState = (location.state as any) || {};
  const [phoneNumber] = useState<string>(locationState.phoneNumber ?? '');

  // Auto-hide the neutral note after a while so it doesn't linger next to resend feedback.
  useEffect(() => {
    const timer = setTimeout(() => {
      setInfoMessage((current) => (current === OTP_INFO_NOTE ? '' : current));
    }, OTP_INFO_NOTE_TIMEOUT);
    return () => clearTimeout(timer);
  }, []);

  // Let's not allow direct navigation to this page
  if (location && location.state === undefined) {
    return <Navigate to="/resetpassword-phone" />;
  }

  if (redirect) {
    return <Navigate to="/login" />;
  }

  // Resend against the phone currently in the form (the user may have edited the prepopulated
  // one). Briefly confirm success so the user knows the OTP went out; on failure show a retry
  // hint (e.g. it was requested too soon) and clear the note so both don't show at once.
  const handleResend = (values: { phoneNumber?: string } = {}) => {
    const phone = values.phoneNumber || phoneNumber;
    sendOTP(phone)
      .then(() => {
        setAuthError('');
        setInfoSuccess(true);
        setInfoMessage('OTP sent successfully.');
        setTimeout(() => {
          setInfoSuccess(false);
          setInfoMessage('');
        }, RESEND_SUCCESS_TIMEOUT);
      })
      .catch(() => {
        setInfoSuccess(false);
        setInfoMessage('');
        setAuthError('Could not resend the OTP. Please try again in 30 seconds.');
      });
  };

  const formFields = [
    {
      component: PhoneInput,
      name: 'phoneNumber',
      type: 'phone',
      placeholder: t('Phone number'),
      helperText: t('Please enter a phone number.'),
    },
    {
      component: Input,
      type: 'otp',
      name: 'OTP',
      placeholder: 'OTP',
      helperText: t('Please confirm the OTP received at your WhatsApp number.'),
      endAdornmentCallback: handleResend,
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: t('New Password'),
    },
  ];

  const FormSchema = Yup.object().shape({
    OTP: Yup.string().required(t('Input required')),
    password: yupPasswordValidation(t),
  });

  const initialFormValues = {
    phoneNumber,
    OTP: '',
    password: '',
  };

  const onSubmitOTP = (values: any) => {
    axios
      .post(RESET_PASSWORD, {
        user: {
          phone: values.phoneNumber,
          password: values.password,
          otp: values.OTP,
        },
      })
      .then(() => {
        setRedirect(true);
      })
      .catch((error) => {
        setAuthError(t('We are unable to update your password, please enter the correct OTP.'));
      });
  };

  return (
    <Auth
      pageTitle={t('Reset your password')}
      buttonText={t('Save')}
      alternateLink="login"
      alternateText={t('Go to login')}
      mode="secondreset"
      formFields={formFields}
      infoMessage={infoMessage}
      infoSuccess={infoSuccess}
      validationSchema={FormSchema}
      saveHandler={onSubmitOTP}
      initialFormValues={initialFormValues}
      errorMessage={authError}
    />
  );
};

export default ResetPasswordConfirmOTP;
