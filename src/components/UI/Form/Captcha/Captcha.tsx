import React, { useEffect, useCallback } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { RECAPTCHA_CLIENT_KEY } from 'config/index';

export interface CaptchaProps {
  onTokenUpdate: any;
  action: string;
  children: any;
  component: any;
  [key: string]: any;
}

export const CaptchaConsumer = ({
  component: Component,
  onTokenUpdate,
  action,
  children,
  ...rest
}: CaptchaProps) => {
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

  return <Component {...rest}>{children}</Component>;
};

export const Captcha = ({ children, component, ...rest }: CaptchaProps) => (
  <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_CLIENT_KEY}>
    <CaptchaConsumer {...rest} component={component}>
      {children}
    </CaptchaConsumer>
  </GoogleReCaptchaProvider>
);
