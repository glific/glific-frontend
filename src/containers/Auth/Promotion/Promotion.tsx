import { useState } from 'react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={minimized ? styles.ContainerMin : styles.ContainerMax}>
      <div className={styles.CardHeader}>
        <div className={styles.Dot} />
        <div className={styles.HeaderText}>NEW!</div>
        {minimized ? (
          <>
            <div className={styles.GiftCard}>New Look Alert!</div>
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
            <div className={styles.BodyListText}>
              <span>{1}</span>
              <div>
                <strong>Big News:</strong> Glific gets a fresh interface starting March 12th! We've
                improved our design for a better experience.
              </div>
            </div>
            <div className={styles.BodyListText}>
              <span>2</span>
              <div>
                <strong>What It Means:</strong> From March 12th, enjoy Glific's sleek, modern look,
                making navigation smoother.
              </div>
            </div>
            <div className={styles.BodyListText}>
              <div>Discover the new Glific. We're excited for you to see the updates!</div>
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
