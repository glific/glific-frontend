import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Typography } from '@mui/material';
import { Input } from 'components/UI/Form/Input/Input';
import { PhoneInput } from 'components/UI/Form/PhoneInput/PhoneInput';
import { Button } from 'components/UI/Form/Button/Button';
import GlificLogo from 'assets/images/logo/Logo.svg';
import { TRIAL_CREATE_USER_API } from 'config/index';
import styles from './TrialRegistration.module.css';

export const TrialRegistration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordFieldInfo = {
    endAdornmentCallback: handlePasswordVisibility,
    togglePassword: showPassword,
  };

  const initialFormValues = {
    organizationName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    otp: '',
  };

  const FormSchema = Yup.object().shape({
    organizationName: Yup.string().required('Organization name is required'),
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    otp: Yup.string().required('OTP is required'),
  });

  const handleSendOTP = async (values: any, validateForm: any) => {
    const { otp, ...fieldsToValidate } = values;
    const errors = await validateForm();

    const hasErrors = Object.keys(errors).some((key) => key !== 'otp');

    if (hasErrors) {
      setAuthError('Please fill all required fields correctly');
      return;
    }

    try {
      setAuthError('');
      setLoading(true);

      const response = await fetch(TRIAL_CREATE_USER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_name: values.organizationName,
          username: values.username,
          email: values.email,
          phone: values.phoneNumber,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      setSuccessMessage('OTP sent successfully to your email');
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('OTP Error:', error);
      setAuthError(error.message || 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setAuthError('');
      setLoading(true);

      console.log('Creating trial account:', values);

      setTimeout(() => {
        setSuccessMessage('Trial account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }, 1000);
    } catch (error: any) {
      setAuthError(error.message || 'Failed to create trial account');
      setLoading(false);
    }
  };

  return (
    <div className={styles.Container} data-testid="TrialRegistrationContainer">
      <div className={styles.Auth}>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>
        <hr className={styles.Break} />

        <div className={styles.OrganizationName}>Glific</div>

        <div className={styles.Box}>
          <>
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
                    {/* Organization Name */}
                    <div className={styles.Spacing}>
                      <Field component={Input} name="organizationName" type="text" placeholder="Organization Name" />
                    </div>

                    {/* Username */}
                    <div className={styles.Spacing}>
                      <Field component={Input} name="username" type="text" placeholder="Username" />
                    </div>

                    {/* Email */}
                    <div className={styles.Spacing}>
                      <Field component={Input} name="email" type="email" placeholder="Email" />
                    </div>

                    {/* Phone Number */}
                    <div className={styles.Spacing}>
                      <Field
                        component={PhoneInput}
                        name="phoneNumber"
                        type="phone"
                        placeholder="Phone Number"
                        helperText="Include country code (e.g., +919876543210)"
                      />
                    </div>

                    {/* Password with Get OTP on the right */}
                    <div className={styles.Spacing}>
                      <Field
                        component={Input}
                        name="password"
                        type="password"
                        placeholder="Password"
                        helperText="Minimum 8 characters"
                        {...passwordFieldInfo}
                      />
                      {/* Get OTP Link - positioned on the right side */}
                      <div className={styles.GetOtpLink}>
                        <button
                          type="button"
                          onClick={() => handleSendOTP(values, validateForm)}
                          className={styles.OtpLinkButton}
                          disabled={loading}
                        >
                          {loading ? 'Sending...' : 'get otp'}
                        </button>
                      </div>
                    </div>

                    {successMessage && <div className={styles.SuccessMessageInline}>{successMessage}</div>}

                    {/* OTP Field - ALWAYS VISIBLE */}
                    <div className={styles.Spacing}>
                      <Field
                        component={Input}
                        name="otp"
                        type="text"
                        placeholder="Enter OTP"
                        helperText={otpSent ? 'Check your email for the OTP' : ''}
                      />
                    </div>

                    {/* Start Trial Button - ALWAYS VISIBLE */}
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
          </>
        </div>
      </div>
    </div>
  );
};

export default TrialRegistration;
