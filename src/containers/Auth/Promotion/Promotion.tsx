import { useState } from 'react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);

  const APPLY_LINK =
    'https://docs.google.com/forms/d/e/1FAIpQLSde02kRz3ljFfji5WFQ514BcSVCRVlW-invWAfopSVHSpgF5w/viewform';
  const LEARN_MORE_LINK = 'https://drive.google.com/file/d/1q0xpv5xeIHJeGeiee_N4Qer2aQzBQ_-r/view';
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
            <span className={styles.Title}>Glific AI Chatbot Accelerator</span>
            <span className={styles.Subtitle}>Applications OPEN NOW!</span>
            <span className={styles.Caption}>For NGOs already using Glific.</span>
          </div>

          <div className={styles.Points}>
            <div className={styles.BodyListText}>
              <p>
                A <b>selective, funded, hands-on 6-month cohort</b> for Glific NGOs like yours — starting or deepening
                their AI journey.
              </p>

              <p className={styles.Perks}>
                <b>What you get:</b> Platform fee waiver, AI & messaging credits to experiment, Expert 1:1 mentorship to
                guide you forward, Performance-based grants to scale.
              </p>

              <p>
                All this for <b>a one-time fee of ₹30K – no additional costs for 6 months</b> (₹2.5L+ value).
              </p>
            </div>

            <div className={styles.ApplyBy}>
              📅 <strong>Apply by: 20 February 2026</strong>
            </div>
          </div>

          <div className={styles.ButtonContainer}>
            <a className={styles.PrimaryButton} href={APPLY_LINK} target="_blank" rel="noreferrer">
              Apply Now
            </a>

            <a className={styles.SecondaryButton} href={LEARN_MORE_LINK} target="_blank" rel="noreferrer">
              Learn More
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Promotion;
