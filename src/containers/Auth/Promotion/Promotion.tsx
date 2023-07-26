import { useState } from 'react';
import { ReactComponent as MinimizeIcon } from 'assets/images/icons/Minimize.svg';
import { ReactComponent as MaximizeIcon } from 'assets/images/icons/Maximize.svg';
import styles from './Promotion.module.css';

const points = [
  'Learn how to integrate ChatGPT with your chatbot to make your conversations more impactful and engaging!',
  'Learn how TAP is using ChatGPT in their chatbot',
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
            <div className={styles.GiftCard}>Glific Webinar</div>
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
            Webinar on ChatGPT integration with Glific 28th July 12 PM
          </div>

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
