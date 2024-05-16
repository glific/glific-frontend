import { useNavigate } from 'react-router';

import styles from './RegistrationHome.module.css';
import GlificLogo from 'assets/images/logo/Logo.svg';
import RegistrationImage from 'assets/images/registrationFormImage.png';
import { Button } from 'components/UI/Form/Button/Button';

export const RegistrationHome = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.Container}>
      <div className={styles.LeftContainer}>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>

        <div className={styles.Header}>
          <h4>Important instructions</h4>
          <p>We recommend to have the information listed below before you advance</p>
        </div>

        <div className={styles.DetailsContainer}>
          <div className={styles.Box}>
            <h4>Glific platform details</h4>
            <ul>
              <li>Registered organization name</li>
              <li>Chatbot number (New WhatsApp chatbot number)</li>
              <li>App name (Gupshup bot)</li>
              <li>Gupshup API keys (Generated)</li>
            </ul>
          </div>

          <div className={styles.Box}>
            <h4>About the organization</h4>
            <ul>
              <li>Registered organization address</li>
              <li>GSTIN number (optional)</li>
              <li>Organization registration document and the certificate</li>
            </ul>
          </div>

          <div className={styles.Box}>
            <h4>Payment details</h4>
            <ul>
              <li>Preferred billing frequency</li>
              <li>Finance POC name and designation</li>
              <li>Finance POC phone number and the email address</li>
            </ul>
          </div>

          <div className={styles.Box}>
            <h4>Submitter/authority info</h4>
            <ul>
              <li>Submitter’s name and address</li>
              <li>Signing authority’s name and the email address</li>
              <li>Signing authority’s designation</li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.RightContainer}>
        <div className={styles.RightHeader}>
          <h1>Set up your NGO on Glific</h1>
          <p>An open source, two way communication based platform</p>
        </div>

        <div className={styles.RegistrationImage}>
          <img src={RegistrationImage} />
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
