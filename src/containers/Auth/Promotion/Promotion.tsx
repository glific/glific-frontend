import { useState } from 'react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={minimized ? styles.ContainerMin : styles.ContainerMax}>
      <div className={styles.CardHeader}>
        <div className={styles.Header}>
          <div className={styles.Dot} />
          <div className={styles.HeaderText}>ALERT!</div>
        </div>
        {minimized ? (
          <>
            <div className={styles.GiftCard}>Glific payment timelines</div>
            <MaximizeIcon
              className={styles.AccordianIcon}
              onClick={() => setMinimized(!minimized)}
            />
          </>
        ) : (
          <MinimizeIcon className={styles.AccordianIcon} onClick={() => setMinimized(!minimized)} />
        )}
      </div>

      {!minimized && (
        <>
          <div className={styles.Image}>Glific payment timelines & late payment consequences</div>

          <div className={styles.Points}>
            <div className={styles.BodyListText}>
              <span>{1}</span>
              <div>
                Glific will send invoice on 1st of every month and you will have 15-day payment
                window.
              </div>
            </div>
            <div className={styles.BodyListText}>
              <span>2</span>
              <div>
                Starting May 1st, 2024, Failure to pay for two consecutive months leads to account
                suspension, halting staff access and messaging bot functionality.
              </div>
            </div>
            <div className={styles.BodyListText}>
              <div>Reach out to Glific team if you have questions/concerns.</div>
            </div>
          </div>
          {/* <a className={styles.Link} href={LINK} target="_blank" rel="noreferrer">
            <div className={styles.KnowMore}>
              <div>REGISTER NOW</div>
              <div className={styles.Arrow}> ↗</div>
            </div>
          </a> */}
        </>
      )}
    </div>
  );
};

export default Promotion;
