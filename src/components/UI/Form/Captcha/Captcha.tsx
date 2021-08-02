import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import { RECAPTCHA_CLIENT_KEY } from 'config/index';

export interface CaptchaProps {
  onChange: any;
  onError?: any;
}

export const Captcha: React.SFC<CaptchaProps> = ({ onChange, onError }) => (
  <div>
    <ReCAPTCHA sitekey={RECAPTCHA_CLIENT_KEY} onChange={onChange} onErrored={onError} />
  </div>
);
export default Captcha;
