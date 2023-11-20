import styles from './HelpIcon.module.css';
import InfoIcon from 'assets/images/info.svg?react';
import { Tooltip } from '@mui/material';

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
  return (
    <Tooltip
      classes={{
        tooltip: styles.Popper,
        arrow: styles.PopperArrow,
      }}
      placement="bottom-start"
      title={
        <>
          {helpData && (
            <div>
              <div className={styles.HoverPopUpText}>
                {helpData.heading}
                {helpData.body}
                <div
                  className={styles.HoverLink}
                  onClick={() => {
                    window.open(helpData.link);
                  }}
                >
                  Learn more
                </div>
              </div>
            </div>
          )}
        </>
      }
      arrow
    >
      <span className={styles.InfoIconContainer}>
        <InfoIcon className={styles.InfoIcon} />
      </span>
    </Tooltip>
  );
};

export default HelpIcon;
