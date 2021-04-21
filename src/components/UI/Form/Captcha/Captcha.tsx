import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { sitekey } from '../../../../config/index';

export interface CaptchaProps {
  onChange: any;
}

export const Captcha: React.SFC<CaptchaProps> = ({ ...props }) => {
  const { onChange } = props;
  return <ReCAPTCHA sitekey={sitekey} onChange={onChange} />;
};
export default Captcha;
