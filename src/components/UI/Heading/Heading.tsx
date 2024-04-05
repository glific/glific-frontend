import { useNavigate } from 'react-router-dom';
import HelpIcon from '../HelpIcon/HelpIcon';
import styles from './Heading.module.css';
import BackIcon from 'assets/images/icons/BackIconFlow.svg?react';

export interface HeadingProps {
  formTitle: string;
  helpData?: any;
  showHeaderHelp?: boolean;
  backLink?: string;
}

export const Heading = ({ formTitle, helpData, showHeaderHelp = true, backLink }: HeadingProps) => {
  const navigate = useNavigate();
  return (
    <div className={styles.Heading} data-testid="heading">
      <div className={styles.HeadingWrapper}>
        {backLink && (
          <BackIcon
            onClick={() => navigate(backLink)}
            className={styles.BackIcon}
            data-testid="back-button"
          />
        )}
        <div>
          <div className={styles.HeadingTitle}>
            <div className={styles.TitleText}>{formTitle}</div>
            {!helpData ? <HelpIcon helpData={helpData} /> : ''}
          </div>
          <div className={styles.TextHeading}>
            {showHeaderHelp ? `Please enter below details.` : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
