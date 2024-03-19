import styles from './HelpIcon.module.css';
import InfoIcon from 'assets/images/info.svg?react';
import { Tooltip } from '@mui/material';
import { HelpDataProps } from 'common/HelpData';

export interface HelpIconProps {
  helpData?: HelpDataProps;
}

export const HelpIcon = ({
  helpData = {
    heading: '',
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
      <span data-testid="help-icon" className={styles.InfoIconContainer}>
        <InfoIcon className={styles.InfoIcon} />
      </span>
    </Tooltip>
  );
};

export default HelpIcon;
