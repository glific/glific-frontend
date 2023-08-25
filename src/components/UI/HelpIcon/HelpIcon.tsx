import { useState } from 'react';
import styles from './HelpIcon.module.css';
import { ReactComponent as InfoIcon } from 'assets/images/info.svg';

export interface HelpDataProps {
  heading: string;
  body: JSX.Element;
  link: string;
}

export interface HelpIconProps {
  helpData?: HelpDataProps;
}

export const HelpIcon = ({
  helpData = {
    heading: '',
    body: <></>,
    link: '',
  },
}: HelpIconProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsPopupOpen(true);
  };

  const handleMouseLeave = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className={styles.Hover} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <InfoIcon className={styles.InfoIcon} />
      {isPopupOpen && helpData && (
        <div className={styles.HoverPopUp}>
          <div className={styles.Triangle}></div>
          <div className={styles.HoverPopUpText}>
            {helpData.heading}
            {helpData.body}
            <div
              className={styles.HoverLink}
              onClick={() => {
                window.location.replace(helpData.link);
              }}
            >
              Learn more
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpIcon;
