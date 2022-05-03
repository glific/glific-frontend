import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import { RECAPTCHA_CLIENT_KEY } from 'config/index';

export interface CaptchaProps {
  onChange: any;
  onError?: any;
}

export const Captcha = ({ onChange, onError }: CaptchaProps) => (
  <div>
    <ReCAPTCHA sitekey={RECAPTCHA_CLIENT_KEY} onChange={onChange} onErrored={onError} />
  </div>
);
export default Captcha;
