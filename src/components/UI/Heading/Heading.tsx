import HelpIcon from '../HelpIcon/HelpIcon';
import styles from './Heading.module.css';

export interface HeadingProps {
  formTitle: string;
  helpData?: any;
  showHeaderHelp?: boolean;
}

export const Heading = ({ formTitle, helpData, showHeaderHelp = true }: HeadingProps) => {
  return (
    <div className={styles.Heading} data-testid="heading">
      <div>
        <div className={styles.HeadingTitle}>
          <div className={styles.TitleText}>{formTitle}</div>
          {helpData ? <HelpIcon helpData={helpData} /> : ''}
        </div>
        <div className={styles.TextHeading}>
          {showHeaderHelp ? `Please enter below details.` : ''}
        </div>
      </div>
    </div>
  );
};
