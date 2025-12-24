import { useState, useRef, useEffect } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { Auth } from '../../Auth/Auth';
import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { TRIAL_CREATE_USER_API, TRIAL_ALLOCATE_ACCOUNT_API } from 'config/index';
import { IconButton, InputAdornment } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Captcha } from 'components/UI/Form/Captcha/Captcha';
import styles from '../../Auth/ConfirmOTP/ConfirmOTP.module.css';

export const TrialRegistration = () => {
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const successMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store form values to use for resend
  const formValuesRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (successMessageTimeoutRef.current) {
        clearTimeout(successMessageTimeoutRef.current);
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const initialFormValues = {
    organizationName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    otp: '',
  };

  const FormSchema = Yup.object().shape({
    organizationName: Yup.string()
      .required('Organization name is required')
      .matches(/^[A-Za-z\s]+$/, 'Organization name can only contain alphabets and spaces')
      .min(5, 'Organization must be at least 5 characters'),
    username: Yup.string()
      .required('Your name is required')
      .matches(/^[A-Za-z\s]+$/, 'Name can only contain alphabets and spaces')
      .min(5, 'Username must be at least 5 characters'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    otp: otpSent ? Yup.string().required('OTP is required') : Yup.string(),
  });

  const handleSendOTP = async (values: any, validateForm: () => Promise<any>) => {
    const errors = await validateForm();
    const hasErrors = Object.keys(errors).some((key) => key !== 'otp');
    if (hasErrors) {
      setAuthError('Please fill all required fields correctly');
      return;
    }
    setAuthError('');
    setLoading(true);

    // Store form values for resend
    formValuesRef.current = values;

    const payload = {
      organization_name: values.organizationName,
      username: values.username,
      email: values.email,
      phone: values.phoneNumber,
      password: values.password,
    };

    try {
      const { data } = await axios.post(TRIAL_CREATE_USER_API, payload);
      setLoading(false);

      if (data.data?.message || (!data.error && data.data)) {
        setOtpSent(true);
        setSuccessMessage(`OTP sent successfully to ${values.email}`);

        if (successMessageTimeoutRef.current) {
          clearTimeout(successMessageTimeoutRef.current);
        }
        successMessageTimeoutRef.current = setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        const errorMessage = data.error || 'Failed to send OTP';
        setAuthError(errorMessage);
      }
    } catch (error: unknown) {
      setLoading(false);
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to send OTP';
      setAuthError(errorMessage);
    }
  };

  const handleResendOTP = async (token: string) => {
    if (!formValuesRef.current) {
      return;
    }

    setAuthError('');
    const payload = {
      organization_name: formValuesRef.current.organizationName,
      username: formValuesRef.current.username,
      email: formValuesRef.current.email,
      phone: formValuesRef.current.phoneNumber,
      password: formValuesRef.current.password,
    };

    try {
      const { data } = await axios.post(TRIAL_CREATE_USER_API, payload);

      if (data.data?.message || (!data.error && data.data)) {
        setSuccessMessage(`OTP resent successfully to ${formValuesRef.current.email}`);

        if (successMessageTimeoutRef.current) {
          clearTimeout(successMessageTimeoutRef.current);
        }
        successMessageTimeoutRef.current = setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        const errorMessage = data.error || 'Failed to resend OTP';
        setAuthError(errorMessage);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to resend OTP';
      setAuthError(errorMessage);
    }
  };

  const handleSubmit = async (values: any) => {
    if (loading) return;

    setAuthError('');
    setLoading(true);

    const payload = {
      organization_name: values.organizationName,
      username: values.username,
      email: values.email,
      phone: values.phoneNumber,
      password: values.password,
      otp: values.otp,
    };

    try {
      const { data } = await axios.post(TRIAL_ALLOCATE_ACCOUNT_API, payload);

      if (data.success && data.data?.login_url) {
        window.location.href = data.data.login_url;
      } else {
        const errorMessage = data.error || 'Failed to create trial account';
        setAuthError(errorMessage);
        setLoading(false);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create trial account';
      setAuthError(errorMessage);
      setLoading(false);
    }
  };

  const getOtpButtonText = () => {
    if (loading) return 'Sending...';
    return 'Get OTP';
  };

  const resendEndAdornment = (
    <InputAdornment position="end">
      <Captcha
        component={IconButton}
        aria-label="resend otp"
        data-testid="resendOtp"
        onClick={handleResendOTP}
        edge="end"
        action="resend"
      >
        <p className={styles.Resend}>resend</p>
        <RefreshIcon classes={{ root: styles.ResendButton }} />
      </Captcha>
    </InputAdornment>
  );

  const formFields: Array<any> = [
    {
      component: Input,
      name: 'organizationName',
      type: 'text',
      placeholder: 'Organization Name',
      styles: 'Spacing',
    },
    {
      component: Input,
      name: 'username',
      type: 'text',
      placeholder: 'Your name',
      styles: 'Spacing',
    },
    {
      component: Input,
      name: 'email',
      type: 'email',
      placeholder: 'Email',
      styles: 'Spacing',
    },
    {
      component: PhoneInput,
      name: 'phoneNumber',
      type: 'phone',
      placeholder: 'Phone Number',
      helperText: 'Include country code (e.g., +919876543210)',
      styles: 'Spacing',
    },
    {
      component: Input,
      name: 'password',
      type: 'password',
      placeholder: 'Create password',
      helperText: 'Minimum 8 characters',
      styles: 'Spacing',
    },
  ];

  // Only add OTP field after OTP is sent
  if (otpSent) {
    formFields.push({
      component: Input,
      name: 'otp',
      type: 'text',
      placeholder: 'Enter OTP',
      helperText: 'Check your email for the OTP',
      styles: 'Spacing OtpFieldSpacing',
      endAdornment: resendEndAdornment,
    });
  }

  return (
    <Auth
      pageTitle="Start Your Glific Trial"
      titleSubText="Create your trial account and explore Glific for free"
      buttonText={otpSent ? 'Start Trial' : 'Get OTP'}
      mode="trialregistration"
      initialFormValues={initialFormValues}
      validationSchema={FormSchema}
      formFields={formFields}
      saveHandler={otpSent ? handleSubmit : null}
      errorMessage={authError}
      successMessage=""
      otpConfig={{
        showGetOtpButton: !otpSent,
        otpButtonText: getOtpButtonText(),
        otpButtonDisabled: loading,
        onGetOtpClick: handleSendOTP,
        otpSuccessMessage: successMessage,
        otpSent: otpSent,
      }}
    />
  );
};

export default TrialRegistration;
