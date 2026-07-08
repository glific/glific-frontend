import { useState, ReactNode } from 'react';
import MinimizeIcon from 'assets/images/icons/Minimize.svg?react';
import MaximizeIcon from 'assets/images/icons/Maximize.svg?react';
import styles from './Promotion.module.css';
import SellIcon from '@mui/icons-material/Sell';
import ChatIcon from '@mui/icons-material/Chat';
import HeadsetIcon from '@mui/icons-material/Headset';
import RedeemIcon from '@mui/icons-material/Redeem';

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

  const REFER_LINK = 'https://forms.gle/PuYdT1tKMBNRWPCn8';

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
            <span className={styles.Title}>Friends of Glific</span>
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
            <p className={styles.BenefitsHeading}>If they come on board, they&apos;ll receive:</p>

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
            <a className={styles.PrimaryButton} href={REFER_LINK} target="_blank" rel="noreferrer">
              Refer an NGO <span className={styles.Arrow}>→</span>
            </a>
          </div>

          <p className={styles.Deadline}>Refer by 31st July 2026</p>
        </>
      )}
    </div>
  );
};

export default Promotion;
