import React, { useState } from 'react';
import { ReactComponent as PromotionImage } from 'assets/images/promotion.svg';
import { ReactComponent as LinkedinIcon } from 'assets/images/icons/Social/Linkedin.svg';
import { ReactComponent as MailIcon } from 'assets/images/icons/Social/Mail.svg';
import { ReactComponent as WhatsAppIcon } from 'assets/images/icons/Social/Whatsapp.svg';
import { ReactComponent as MinimizeIcon } from 'assets/images/icons/Minimize.svg';
import { ReactComponent as MaximizeIcon } from 'assets/images/icons/Maximize.svg';
import styles from './Promotion.module.css';

const promotionContent = `Hi everyone, 60+ NGOs have used Glific to scale their operations, create lasting impact on the communities and change lives of thousands of beneficiaries through Glific’s WhatsApp chatbot.

To support more NGOs in their journey, Glific has launched a Joy of Giving campaign. Through the campaign NGO’s can get 1 month of free WhatsApp Glific subscription.

Tag/comment NGOs in your network that can benefit from the campaign.

NGOs click here to get the referral benefits: https://lnkd.in/dXw8JTX7`;

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
