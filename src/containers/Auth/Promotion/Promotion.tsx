import { useState, ReactNode } from 'react';
import { usePostHog } from '@posthog/react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';
import SellIcon from '@mui/icons-material/Sell';
import ChatIcon from '@mui/icons-material/Chat';
import HeadsetIcon from '@mui/icons-material/Headset';
import RedeemIcon from '@mui/icons-material/Redeem';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

interface Benefit {
  icon: ReactNode;
  title: string;
  desc: string;
}

const benefits: Benefit[] = [
  {
    icon: <SellIcon />,
    title: '₹15,000 setup fee waived',
    desc: "We'll cover their one-time setup fee.",
  },
  {
    icon: <ChatIcon />,
    title: 'Complimentary use case discovery session',
    desc: "We'll help them find the right use of Glific.",
  },
  {
    icon: <HeadsetIcon />,
    title: 'Guided onboarding support',
    desc: "We'll support them every step of the way.",
  },
];

export const Promotion = () => {
  const [minimized, setMinimized] = useState(false);
  const posthog = usePostHog();

  // The org's shortcode is the first label of its subdomain (e.g. `tides` in tides.tap.glific.org).
  const shortcode = window.location.hostname.split('.')[0];

  const trackReferral = (channel: 'email' | 'whatsapp') => {
    posthog?.capture('promotion_referral_clicked', { shortcode, channel });
  };

  const MAIL_LINK = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&cc=sneha@glific.org,connect@glific.org&su=I'd%20love%20to%20introduce%20you%20to%20the%20Glific%20team&body=Hi%20%5BName%5D%2C%0A%0AI%20wanted%20to%20introduce%20you%20to%20Sneha%20from%20Glific.%20We've%20been%20using%20the%20platform%20for%20%5BX%20months%2Fyears%5D%2C%20and%20I%20thought%20it%20could%20be%20genuinely%20useful%20for%20your%20work.%0A%0AGlific%20helps%20NGOs%20use%20WhatsApp%20for%20beneficiary%20engagement%2C%20data%20collection%2C%20and%20program%20automation.%20For%20us%2C%20it's%20helped%20with%20%5Bspecific%20example%5D.%0A%0AI'm%20making%20this%20introduction%20through%20Glific's%20Friends%20of%20Glific%20offer.%20If%20you%20decide%20to%20move%20forward%2C%20Glific%20will%20cover%20the%20one-time%20setup%20fee%20(₹15%2C000)%2C%20provide%20a%20complimentary%20use%20case%20discovery%20session%2C%20and%20support%20your%20onboarding.%0A%0AI%20think%20it's%20worth%20a%2030-minute%20conversation.%0A%0ASneha%2C%20over%20to%20you.%0A%0AWarm%20regards%2C%0A%5BYour%20Name%5D`;
  const WHATSAPP_LINK = `https://wa.me/?text=Hi!%20We've%20been%20using%20Glific%20to%20run%20our%20WhatsApp%20engagement%20and%20thought%20it%20could%20be%20useful%20for%20your%20organisation%20too.%0A%0AThey're%20currently%20waiving%20the%20setup%20fee%20and%20offering%20a%20complimentary%20discovery%20session.%20Let%20me%20know%20if%20you'd%20like%20an%20introduction.`;

  return (
    <div className={minimized ? styles.ContainerMin : styles.ContainerMax}>
      <div className={styles.CardHeader} onClick={() => setMinimized(!minimized)}>
        <div className={styles.Header}>
          <>
            <div className={styles.Dot} />
            <div className={styles.HeaderText}>ANNOUNCEMENT!</div>
          </>

          {minimized && <div className={styles.GiftCard}>Friends of Glific</div>}
        </div>

        {minimized ? (
          <>
            <MaximizeIcon className={styles.AccordianIcon} />
          </>
        ) : (
          <MinimizeIcon className={styles.AccordianIcon} />
        )}
      </div>

      {!minimized && (
        <>
          <div className={styles.Hero}>
            <span className={styles.HeroIcon}>{/* <GroupsIcon /> */}</span>
            <span className={styles.Title}>Friends of Glific Referral Program</span>
          </div>

          <div className={styles.Intro}>
            <p className={styles.IntroLead}>
              The best organizations on Glific come through referrals from our community.
            </p>
            <p className={styles.IntroPrompt}>
              Know someone who should explore Glific? <span className={styles.Emphasis}>Introduce us.</span>
            </p>
          </div>

          <div className={styles.Benefits}>
            <p className={styles.BenefitsHeading}>Every referred NGO receives</p>

            {benefits.map((benefit) => (
              <div className={styles.BenefitRow} key={benefit.title}>
                <span className={styles.BenefitIcon}>{benefit.icon}</span>
                <div className={styles.BenefitText}>
                  <span className={styles.BenefitTitle}>{benefit.title}</span>
                  <span className={styles.BenefitDesc}>{benefit.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.Reward}>
            <span className={styles.RewardIcon}>
              <RedeemIcon />
            </span>
            <p className={styles.RewardText}>
              As a thank you, we&apos;ll <b>waive 3 months of your platform fees</b> (₹27,500 value).
            </p>
          </div>

          <div className={styles.ButtonContainer}>
            <a
              className={styles.PrimaryButton}
              href={MAIL_LINK}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackReferral('email')}
            >
              <EmailIcon className={styles.ButtonIcon} />
              Refer via Email
            </a>

            <a
              className={styles.SecondaryButton}
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackReferral('whatsapp')}
            >
              <WhatsAppIcon className={styles.ButtonIcon} />
              Refer via WhatsApp
            </a>
          </div>

          <p className={styles.Deadline}>Offer valid until 31 July 2026</p>
        </>
      )}
    </div>
  );
};

export default Promotion;
