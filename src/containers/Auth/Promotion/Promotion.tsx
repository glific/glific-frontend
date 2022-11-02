import React, { useState } from 'react';
import { ReactComponent as PromotionImage } from 'assets/images/promotion.svg';
import { ReactComponent as LinkedinIcon } from 'assets/images/icons/Social/Linkedin.svg';
import { ReactComponent as MailIcon } from 'assets/images/icons/Social/Mail.svg';
import { ReactComponent as WhatsAppIcon } from 'assets/images/icons/Social/Whatsapp.svg';
import { ReactComponent as MinimizeIcon } from 'assets/images/icons/Minimize.svg';
import { ReactComponent as MaximizeIcon } from 'assets/images/icons/Maximize.svg';
import styles from './Promotion.module.css';

const socialIcons = [
  {
    link: '',
    icon: <WhatsAppIcon />,
  },
  {
    link: '',
    icon: <LinkedinIcon />,
  },
  {
    link: '',
    icon: <MailIcon />,
  },
];

const points = [
  'Share this card with a friend at another NGO.',
  'Get 1 month free subscription from Glific.',
];

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={minimized ? styles.ContainerMin : styles.ContainerMax}>
      <div className={styles.CardHeader}>
        <div className={styles.Dot} />
        <div className={styles.HeaderText}>NEW!</div>
        {minimized ? (
          <>
            <div className={styles.GiftCard}>GIFT CARD</div>
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
          <div className={styles.BodyUcaseText}>
            <PromotionImage />
          </div>

          <div className={styles.Points}>
            {points.map((point, index) => (
              <p className={styles.BodyListText}>
                <div>{index + 1}</div>
                {point}
              </p>
            ))}
          </div>
          <div className={styles.ShareNow}>
            <b>SHARE NOW</b>
          </div>

          <div className={styles.SocialIcons}>
            {socialIcons.map((socialIcon: any) => (
              <a href={socialIcon.link} target="_blank" rel="noreferrer">
                {socialIcon.icon}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Promotion;
