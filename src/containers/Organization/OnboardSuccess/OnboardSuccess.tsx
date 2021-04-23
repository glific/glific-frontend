import React from 'react';
import GlificLogo from '../../../assets/images/logo/Logo.svg';
import styles from './OnboardSuccess.module.css';

export const OnboardSuccess: React.SFC = () => {
  console.log('onboard setup success');
  return (
    <div className={styles.Container} data-testid="setupInitiation">
      <div className={styles.Organization}>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>
        <div className={styles.Title}>
          Thank you! Your setup has been initiated.
          <div>We will get back to you with further steps once the setup is complete.</div>
        </div>
      </div>
    </div>
  );
};
export default OnboardSuccess;
