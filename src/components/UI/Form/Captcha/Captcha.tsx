import { useEffect, useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export interface CaptchaProps {
  onTokenUpdate: any;
  action: string;
  children: any;
  component: any;
  onClick: any;
  [key: string]: any;
}

export const Captcha = ({
  component: Component,
  onTokenUpdate,
  action,
  children,
  onClick,
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

  return (
    <Component
      onClick={() => {
        handleReCaptchaVerify().then(() => onClick());
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};
