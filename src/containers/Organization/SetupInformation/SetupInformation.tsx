import React from 'react';
import { useHistory } from 'react-router-dom';

import CallMadeSharpIcon from '@material-ui/icons/CallMadeSharp';
import { Button } from '../../../components/UI/Form/Button/Button';
import GlificLogo from '../../../assets/images/logo/Logo.svg';
import styles from './SetupInformation.module.css';

export const SetupInformation: React.SFC = () => {
  const history = useHistory();

  return (
    <div className={styles.Container} data-testid="setupInformation">
      <div className={styles.Organization}>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>
        <div className={styles.Title}>
          <span> Setup your NGO on Glific</span>
        </div>
        <div className={styles.subtitle}>
          Before you get started, please make sure you have completed the following processes:
        </div>

        <div className={styles.links}>
          <ol>
            <li>
              <a href="https://glific.slab.com/public/posts/facebook-verification-process-for-wa-business-api-065jvy5a">
                Facebook business manager verification
                <CallMadeSharpIcon style={{ color: '#119656', height: '16px' }} />
              </a>
            </li>
            <li>
              <a href=" https://glific.slab.com/public/posts/setup-the-organization-on-gupshup-and-go-live-qwbjphx0">
                Gupshup account creation
                <CallMadeSharpIcon style={{ color: '#119656', height: '16px' }} />
              </a>
            </li>
          </ol>
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            className={styles.continueButton}
            data-testid="ContinueButton"
            onClick={() => {
              history.push('/onboard-setup');
            }}
          >
            CONTINUE
          </Button>
        </div>
      </div>
    </div>
  );
};
export default SetupInformation;
