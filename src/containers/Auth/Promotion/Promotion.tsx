import React, { useState } from 'react';
import { ReactComponent as PromotionImage } from 'assets/images/promotion.svg';
import { ReactComponent as LinkedinIcon } from 'assets/images/icons/Social/Linkedin.svg';
import { ReactComponent as MailIcon } from 'assets/images/icons/Social/Mail.svg';
import { ReactComponent as WhatsAppIcon } from 'assets/images/icons/Social/Whatsapp.svg';
import { ReactComponent as MinimizeIcon } from 'assets/images/icons/Minimize.svg';
import { ReactComponent as MaximizeIcon } from 'assets/images/icons/Maximize.svg';
import styles from './Promotion.module.css';

const promotionContent = `Hey! Here's a gift card for 1 month free subscription of Glific. Use this link to redeem the gift: https://wa.me/+917302307943?text=JoyOfGiving`;

const socialIcons = [
  {
    link: `https://wa.me/?text=${encodeURIComponent(promotionContent)}`,
    icon: <WhatsAppIcon />,
  },
  {
    link: 'https://www.linkedin.com/sharing/share-offsite/?url=https://www.linkedin.com/posts/glific_whatsappchatbot-whatsappbusinessapi-glific-activity-6991329445751975937-Zbok/?utm_source=share&utm_medium=member_desktop',
    icon: <LinkedinIcon />,
  },
  {
    link: `mailto:?body=${encodeURIComponent(promotionContent)}`,
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
          <div className={styles.Image}>
            <PromotionImage />
          </div>

          <div className={styles.Points}>
            {points.map((point, index) => (
              <p className={styles.BodyListText} key={point}>
                <span>{index + 1}</span>
                {point}
              </p>
            ))}
          </div>
          <div className={styles.ShareNow}>
            <b>SHARE NOW</b>
          </div>

          <div className={styles.SocialIcons}>
            {socialIcons.map((socialIcon: any) => (
              <a href={socialIcon.link} target="_blank" rel="noreferrer" key={socialIcon.link}>
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
