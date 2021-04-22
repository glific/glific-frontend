import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { SITEKEY } from '../../../../config/index';
import styles from './Captcha.module.css';

export interface CaptchaProps {
  onChange: any;
  onExpire?: any;
  onError?: any;
}

export const Captcha: React.SFC<CaptchaProps> = ({ ...props }) => {
  const { onChange, onExpire, onError } = props;
  return (
    <div className={styles.captcha}>
      <ReCAPTCHA sitekey={SITEKEY} onChange={onChange} onExpired={onExpire} onErrored={onError} />
    </div>
  );
};
export default Captcha;
