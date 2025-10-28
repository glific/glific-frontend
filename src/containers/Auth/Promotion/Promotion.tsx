import PlaceIcon from '@mui/icons-material/Place';
import { useState } from 'react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';
export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);
  const REGISTRATION_LINK =
    'https://glific.org/were-back-with-glific-launchpad-build-your-first-ai-powered-whatsapp-chatbot-in-2-days/';
  const REFERRAL_LINK = 'https://forms.gle/2x1tvmbaNNDp4wCD9';
  const BROCHURE_LINK = 'https://drive.google.com/file/d/1teKiP6NuOwA4Ob_lj5W9ce4HweWM1yAB/view?usp=drive_link';

  return (
    <div className={minimized ? styles.ContainerMin : styles.ContainerMax}>
      <div onClick={() => setMinimized(!minimized)} className={styles.CardHeader}>
        <div className={styles.Header}>
          <div className={styles.Dot} />
          <div className={styles.HeaderText}>NEW!</div>
        </div>
        {minimized ? (
          <>
            <div className={styles.GiftCard}>Glific Launchpad</div>
            <MaximizeIcon className={styles.AccordianIcon} />
          </>
        ) : (
          <MinimizeIcon className={styles.AccordianIcon} />
        )}
      </div>

      {!minimized && (
        <>
          <div className={styles.Image}>
            <span className={styles.Title}>
              Got a new idea?
              <br /> Let's build your next chatbot!
            </span>
            <span>27-28 November</span>
            <span className={styles.Place}>
              <PlaceIcon />
              Mumbai
            </span>
          </div>

          <div className={styles.Points}>
            <div className={styles.BodyListText}>
              <p>
                <strong>Join the Glific Launchpad</strong> — a 2-day hands-on program where our team helps you build a
                WhatsApp chatbot from scratch for your next project.
              </p>
              <br />

              <p>Love what you built? Apply to build another bot or refer an NGO that could benefit from Glific.</p>
              <p className={styles.LastDate}>Last date to apply is 5th November</p>
            </div>
          </div>

          <div className={styles.ButtonContainer}>
            <a className={styles.PrimaryButton} href={REGISTRATION_LINK} target="_blank" rel="noreferrer">
              Learn More
            </a>
            <a className={styles.SecondaryButton} href={REFERRAL_LINK} target="_blank" rel="noreferrer">
              Submit Referral
            </a>
            <a className={styles.SecondaryButton} href={BROCHURE_LINK} target="_blank" rel="noreferrer">
              Download Brochure
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Promotion;
