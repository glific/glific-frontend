import { useState } from 'react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);
  const LINK = 'https://us06web.zoom.us/meeting/register/tZYpceqqrzIqGd3W7dSrHS2VGzFhdSq2exYR';

  return (
    <div className={minimized ? styles.ContainerMin : styles.ContainerMax}>
      <div className={styles.CardHeader}>
        <div className={styles.Header}>
          <div className={styles.Dot} />
          <div className={styles.HeaderText}>NEW!</div>
        </div>
        {minimized ? (
          <>
            <div className={styles.GiftCard}>Level up with Glific</div>
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
          <div className={styles.Image}>
            <span>
              Level up with Glific <br />
              Q&A with Gupshup
            </span>
            <span>19th June, 3-4PM</span>
          </div>

          <div className={styles.Points}>
            <div className={styles.BodyListText}>
              <span>{1}</span>
              <div>
                Get answers to commonly asked questions- Message categories, gupshup wallet &
                costing, message delivery etc.
              </div>
            </div>
            <div className={styles.BodyListText}>
              <span>2</span>
              <div>Open session to ask questions to Gupshup team directly.</div>
            </div>
            {/* <div className={styles.BodyListText}>
              <div>Reach out to Glific team if you have questions/concerns.</div>
            </div> */}
          </div>
          <a className={styles.Link} href={LINK} target="_blank" rel="noreferrer">
            <div className={styles.KnowMore}>
              <div>REGISTER NOW</div>
              <div className={styles.Arrow}> ↗</div>
            </div>
          </a>
        </>
      )}
    </div>
  );
};

export default Promotion;
