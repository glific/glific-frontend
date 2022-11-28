import React, { useState } from 'react';
import { ReactComponent as MinimizeIcon } from 'assets/images/icons/Minimize.svg';
import { ReactComponent as MaximizeIcon } from 'assets/images/icons/Maximize.svg';
import styles from './Promotion.module.css';

const points = [
  'For any new NGOs that wants to use WhatsApp.',
  'Share with someone who might benefit from this.',
];

const LINK = 'https://glific---chintugudiyafoundation-22443339.hubspotpagebuilder.com/bootcamp';

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={minimized ? styles.ContainerMin : styles.ContainerMax}>
      <div className={styles.CardHeader}>
        <div className={styles.Dot} />
        <div className={styles.HeaderText}>NEW!</div>
        {minimized ? (
          <>
            <div className={styles.GiftCard}>JUMPSTART</div>
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
          <div className={styles.Image}>Jumpstart your program on WhatsApp in 2 days!</div>

          <div className={styles.Points}>
            {points.map((point, index) => (
              <p className={styles.BodyListText} key={point}>
                <span>{index + 1}</span>
                {point}
              </p>
            ))}
          </div>
          <a className={styles.Link} href={LINK} target="_blank" rel="noreferrer">
            <div className={styles.KnowMore}>
              <div>KNOW MORE</div>
              <div className={styles.Arrow}> ↗</div>
            </div>
          </a>
        </>
      )}
    </div>
  );
};

export default Promotion;
