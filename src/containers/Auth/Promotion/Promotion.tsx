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
      <div className={styles.CardHeader} onClick={() => setMinimized(!minimized)}>
        <div className={styles.Header}>
          <div className={styles.Dot} />
          <div className={styles.HeaderText}>ANNOUNCEMENT ALERT!</div>
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
            <span className={styles.Title}>
              Glific AI Chatbot Accelerator
              <br />
              Applications OPEN NOW!
            </span>
          </div>

          <div className={styles.Points}>
            <div className={styles.BodyListText}>
              <p>
                A selective, funded, hands-on <strong>6-month cohort</strong> for <strong>30 NGOs</strong>:
                <br />
                15 existing Glific NGOs starting or deepening their AI journey, and 15 new NGOs building AI-powered
                WhatsApp chatbots.
              </p>

              <p>
                <strong>Perks include:</strong> Platform fee waiver, AI & messaging credits, expert mentorship,
                performance-based grants.
              </p>

              <p>
                All this for a <strong>one-time fee of ₹30K</strong> – no additional costs for 6 months (
                <strong>₹2.5L+ value</strong>).
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
