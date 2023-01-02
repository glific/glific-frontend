import React, { useState } from 'react';
import { ReactComponent as MinimizeIcon } from 'assets/images/icons/Minimize.svg';
import { ReactComponent as MaximizeIcon } from 'assets/images/icons/Maximize.svg';
import styles from './Promotion.module.css';

const points = [
  'A community event where you get to meet  other NGOs and learn from each other to create a better impact with Glific.',
  'Work with Glific team to share  your challenges better and try to solve it during the sprint.',
];

const LINK =
  'https://docs.google.com/spreadsheets/d/12Yd9dU8aUpiabjlf5emJM1XWWlVslv8fZBV_IlPa7xc/edit#gid=13579334';

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={minimized ? styles.ContainerMin : styles.ContainerMax}>
      <div className={styles.CardHeader}>
        <div className={styles.Dot} />
        <div className={styles.HeaderText}>NEW!</div>
        {minimized ? (
          <>
            <div className={styles.GiftCard}>GLIFIC SPRINT</div>
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
          <div className={styles.Image}>Glific&apos;s upcoming sprint from Jan 17-20 in Goa</div>

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
