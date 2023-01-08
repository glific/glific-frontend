import React, { useEffect, useCallback } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { RECAPTCHA_CLIENT_KEY } from 'config/index';
import { Button, ButtonProps } from '../Button/Button';

export interface CaptchaProps extends ButtonProps {
  onTokenUpdate: any;
  action: string;
  children: any;
}

export const CaptchaButton = ({ onTokenUpdate, action, children, ...rest }: CaptchaProps) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      return;
    }

    const token = await executeRecaptcha(action);
    onTokenUpdate(token);
  }, [executeRecaptcha]);

  // You can use useEffect to trigger the verification as soon as the component being loaded
  useEffect(() => {
    handleReCaptchaVerify();
  }, [handleReCaptchaVerify]);

  return <Button {...rest}>{!rest.loading && children}</Button>;
};

export const Captcha = ({ children, ...rest }: CaptchaProps) => (
  <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_CLIENT_KEY}>
    <CaptchaButton {...rest}>{children}</CaptchaButton>
  </GoogleReCaptchaProvider>
);
