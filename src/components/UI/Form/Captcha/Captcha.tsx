import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export interface CaptchaProps {
  action: string;
  children: any;
  component: any;
  onClick: any;
  [key: string]: any;
}

export const Captcha = ({ component: Component, action, children, onClick, ...rest }: CaptchaProps) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Create an event handler so you can call the verification on button click event or form submit
  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      return null;
    }
    const token = await executeRecaptcha(action);
    if (!token) {
      return { error: 'Failed to generate token' };
    }

    return token;
  }, [executeRecaptcha]);

  return (
    <Component
      onClick={async () => {
        const token = await handleReCaptchaVerify();
        onClick(token);
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};
