import { useState } from 'react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);

  const APPLY_LINK = 'https://forms.gle/PuYdT1tKMBNRWPCn8';
  const LEARN_MORE_LINK = 'https://drive.google.com/file/d/1UjpG_WAV9OcUKYD0VXA4AMQOvg20gT60/view?usp=drive_link';

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
            <span className={styles.Caption}>For NGOs already using Glific</span>
          </div>

          <div className={styles.Points}>
            <div className={styles.BodyListText}>
              <p>
                A <b>selective, funded, hands-on 6-month cohort</b> for Glific NGOs like yours — starting or deepening
                their AI journey.
              </p>

              <p className={styles.Perks}>
                <b>What you get:</b> SaaS advantage—platform fees waived, AI & messaging credits to experiment, Expert
                1:1 mentorship to guide you forward, Performance-based grants to scale.
              </p>

              <p>
                All this for a <b>one-time fee of ₹30K – no additional costs for 6 months</b> (₹2.5L+ value).
              </p>
            </div>

            <div className={styles.ApplyBy}>
              📅 <strong>[Extended] Apply by: 1st March 2026</strong>
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
