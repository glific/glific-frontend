import PlaceIcon from '@mui/icons-material/Place';
import { useState } from 'react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);

  const APPLY_LINK =
    'https://docs.google.com/forms/d/e/1FAIpQLSde02kRz3ljFfji5WFQ514BcSVCRVlW-invWAfopSVHSpgF5w/viewform';
  const LEARN_MORE_LINK = 'https://glific.org/glific-ai-chatbot-accelerator-2026/';
  const REFERRAL_LINK =
    'https://docs.google.com/forms/d/e/1FAIpQLSd6cjfBCaSx_zvEdTo3tjKFiZVzjTOxJ8SAokv7Z9JZidYdNw/viewform';

  return (
    <div className={minimized ? styles.ContainerMin : styles.ContainerMax}>
      <div onClick={() => setMinimized(!minimized)} className={styles.CardHeader}>
        <div className={styles.Header}>
          <div className={styles.Dot} />
          <div className={styles.HeaderText}>NEW!</div>
        </div>

        {minimized ? (
          <>
            <div className={styles.GiftCard}>Glific AI Chatbot Accelerator</div>
            <MaximizeIcon className={styles.AccordianIcon} />
          </>
        ) : (
          <MinimizeIcon className={styles.AccordianIcon} />
        )}
      </div>

      {!minimized && (
        <>
          <div className={styles.Image}>
            <span>
              Glific AI Chatbot Accelerator
              <br />
              Applications now open!
            </span>
            <span>Apply by: 20 February 2026</span>
          </div>

          <div className={styles.Points}>
            <div className={styles.BodyListText}>
              <p>
                <strong>A selective, funded, hands-on 6-month cohort</strong> for 30 NGOs — 15 existing Glific users
                looking to implement AI, and 15 new NGOs building an AI-powered WhatsApp chatbot.
              </p>
              <br />
              <p>
                Includes platform fee waiver, AI + messaging credits, expert mentorship, 2 in-person workshops, and
                performance-based grants.
              </p>
              <br />
              <p>
                <strong>₹2.5L+ value</strong> for a <strong>₹30K cohort fee</strong>
                (no additional costs for 6 months).
              </p>
            </div>
          </div>

          <div className={styles.ButtonContainer}>
            <a className={styles.PrimaryButton} href={APPLY_LINK} target="_blank" rel="noreferrer">
              Apply Now
            </a>
            <a className={styles.SecondaryButton} href={LEARN_MORE_LINK} target="_blank" rel="noreferrer">
              Learn More
            </a>
            <a className={styles.SecondaryButton} href={REFERRAL_LINK} target="_blank" rel="noreferrer">
              Submit Referral
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Promotion;
