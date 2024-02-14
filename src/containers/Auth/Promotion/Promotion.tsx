import { useState } from 'react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';

const points = [
  'We are migrating from "tides.coloredcow.com" to "glific.com" and you will be automatically redirected to the correct URL',
  'For eg. if your URL is staging.tides.coloredcow.com, the updated URL will be staging.glific.com',
];

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
            <div className={styles.GiftCard}>Domain migration</div>
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
          <div className={styles.Image}>Domain name migration</div>

          <div className={styles.Points}>
            {points.map((point, index) => (
              <p className={styles.BodyListText} key={point}>
                <span>{index + 1}</span>
                {point}
              </p>
            ))}
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
