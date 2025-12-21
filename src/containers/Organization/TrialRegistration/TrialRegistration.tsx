import { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Typography } from '@mui/material';
import axios from 'axios';
import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { Button } from 'components/UI/Form/Button/Button';
import GlificLogo from 'assets/images/logo/Logo.svg';
import { TRIAL_CREATE_USER_API, TRIAL_ALLOCATE_ACCOUNT_API } from 'config/index';
import styles from './TrialRegistration.module.css';

interface TrialFormValues {
  organizationName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  otp: string;
}

export const TrialRegistration = () => {
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const successMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordFieldInfo = {
    endAdornmentCallback: handlePasswordVisibility,
    togglePassword: showPassword,
  };

  const initialFormValues: TrialFormValues = {
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
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    otp: Yup.string().required('OTP is required'),
  });

  const handleSendOTP = async (values: TrialFormValues, validateForm: () => Promise<Record<string, string>>) => {
    const errors = await validateForm();
    const hasErrors = Object.keys(errors).some((key) => key !== 'otp');
    if (hasErrors) {
      setAuthError('Please fill all required fields correctly');
      return;
    }
    setAuthError('');
    setLoading(true);
    const payload = {
      organization_name: values.organizationName,
      username: values.username,
      email: values.email,
      phone: values.phoneNumber,
      password: values.password,
    };

    await axios
      .post(TRIAL_CREATE_USER_API, payload)
      .then(({ data }) => {
        setLoading(false);

        if (data.success !== false) {
          setOtpSent(true);
          setSuccessMessage('OTP sent successfully to your email');

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
      })
      .catch((error: unknown) => {
        setLoading(false);
        const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
        const errorMessage =
          err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to send OTP';
        setAuthError(errorMessage);
      });
  };

  const handleSubmit = async (values: TrialFormValues) => {
    if (loading) return;

    setAuthError('');
    setSuccessMessage('');
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
        setSuccessMessage('Trial account created successfully! Redirecting to login...');
        setLoading(false);

        redirectTimeoutRef.current = setTimeout(() => {
          window.location.href = data.data.login_url;
        }, 2000);
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
    if (otpSent) return 'resend otp';
    return 'get otp';
  };

  return (
    <div className={styles.Container} data-testid="TrialRegistrationContainer">
      <div className={styles.Auth}>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>
        <hr className={styles.Break} />

        <div className={styles.Box}>
          <div className={styles.BoxTitle}>
            <Typography variant="h4" classes={{ root: styles.TitleText }}>
              Start Your Glific Trial
            </Typography>
          </div>
          <div className={styles.SubText}>Create your trial account and explore Glific for free</div>

          <Formik initialValues={initialFormValues} validationSchema={FormSchema} onSubmit={handleSubmit}>
            {({ values, validateForm }) => (
              <div className={styles.CenterBox}>
                <Form className={styles.Form}>
                  <div className={styles.Spacing}>
                    <Field component={Input} name="organizationName" type="text" placeholder="Organization Name" />
                  </div>
                  <div className={styles.Spacing}>
                    <Field component={Input} name="username" type="text" placeholder="Your name" />
                  </div>
                  <div className={styles.Spacing}>
                    <Field component={Input} name="email" type="email" placeholder="Email" />
                  </div>
                  <div className={styles.Spacing}>
                    <Field
                      component={PhoneInput}
                      name="phoneNumber"
                      type="phone"
                      placeholder="Phone Number"
                      helperText="Include country code (e.g., +919876543210)"
                    />
                  </div>
                  <div className={styles.Spacing}>
                    <Field
                      component={Input}
                      name="password"
                      type="password"
                      placeholder="Create password"
                      helperText="Minimum 8 characters"
                      {...passwordFieldInfo}
                    />
                    <div className={styles.GetOtpLink}>
                      <button
                        type="button"
                        onClick={() => handleSendOTP(values, validateForm)}
                        className={styles.OtpLinkButton}
                        disabled={loading}
                      >
                        {getOtpButtonText()}
                      </button>
                    </div>
                  </div>
                  {successMessage && <div className={styles.SuccessMessageInline}>{successMessage}</div>}
                  <div className={styles.Spacing}>
                    <Field
                      component={Input}
                      name="otp"
                      type="text"
                      placeholder="Enter OTP"
                      helperText={otpSent ? 'Check your email for the OTP' : ''}
                    />
                  </div>
                  <div className={styles.CenterButton}>
                    <Button
                      variant="outlined"
                      color="primary"
                      type="submit"
                      className={styles.AuthButton}
                      data-testid="StartTrialButton"
                      loading={loading}
                    >
                      {!loading && 'Start Trial'}
                    </Button>
                  </div>
                  {authError && <div className={styles.ErrorMessage}>{authError}</div>}
                  <input className={styles.SubmitAction} type="submit" />
                </Form>
              </div>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default TrialRegistration;
