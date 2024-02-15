import { useState } from 'react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';

const hostname = location.hostname.replace('.glific.com', '');

const LINK = 'https://rb.gy/ywfqp';

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={minimized ? styles.ContainerMin : styles.ContainerMax}>
      <div className={styles.CardHeader}>
        <div className={styles.Dot} />
        <div className={styles.HeaderText}>NEW!</div>
        {minimized ? (
          <>
            <div className={styles.GiftCard}>New Website Address!</div>
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
          <div className={styles.Image}>New Website Address!</div>

          <div className={styles.Points}>
            <p className={styles.BodyListText}>
              <span>{1}</span>
              <div>
                We're Moving: <strong>tides.coloredcow.com</strong> is changing to{' '}
                <strong>glific.com</strong>! To access your Glific account use{' '}
                <strong>{hostname}.glific.com </strong>
                instead of{' '}
                <strong>
                  {hostname}
                  .tides.coloredcow.com
                </strong>
              </div>
            </p>
            <p className={styles.BodyListText}>
              <span>2</span>
              <div>
                What this means? <strong>{hostname}.tides.coloredcow.com </strong>
                page will become inactive on 31st March. Bookmark the new Glific address right away
              </div>
            </p>
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
