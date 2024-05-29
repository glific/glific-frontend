import { useNavigate } from 'react-router';

import styles from './Home.module.css';
import GlificLogo from 'assets/images/logo/Logo.svg';
import { Button } from 'components/UI/Form/Button/Button';

export const RegistrationHome = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.Container}>
      <div className={styles.Main}>
        <div className={styles.HeaderSection}>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
          <p>An open source, two-way communication platform</p>
        </div>

        <div className={styles.MainBox}>
          <div className={styles.Header}>
            <h1>Important instructions</h1>
            <p>We recommend to have the information listed below before you advance</p>
          </div>
          <div className={styles.DetailsContainer}>
            <div className={styles.Box}>
              <h3>Chatbot details</h3>
              <ul>
                <li>Registered organization name</li>
                <li>Whatsapp chatbot number</li>
                <li>App name (Gupshup bot)</li>
                <li>Gupshup API key</li>
              </ul>
            </div>

            <div className={styles.Box}>
              <h3>Organization</h3>
              <ul>
                <li>Registered organization address</li>
                <li>Current organization address</li>
                <li>GSTIN number (optional)</li>
              </ul>
            </div>

            <div className={styles.Box}>
              <h3>Billing</h3>
              <ul>
                <li>Preferred billing frequency</li>
                <li>Finance point of contact name, designation, phone number and email address</li>
              </ul>
            </div>

            <div className={styles.Box}>
              <h3>Submitter & Signing Authority Information</h3>
              <ul>
                <li>Submitter’s name and email address</li>
                <li>Signing authority’s name, designation and email address</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.GetStarted}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              navigate('/organization-registration/setup');
            }}
            className={styles.Button}
            data-testid="submitActionButton"
          >
            Get started
          </Button>

          <p>
            By proceeding, you consent to providing all the necessary information that has been
            validated by the signing authority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationHome;
