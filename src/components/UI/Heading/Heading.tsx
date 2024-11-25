import { useNavigate } from 'react-router-dom';
import HelpIcon from '../HelpIcon/HelpIcon';
import styles from './Heading.module.css';
import BackIcon from 'assets/images/icons/BackIconFlow.svg?react';
import { Button } from '../Form/Button/Button';
import AddIcon from 'assets/images/add.svg?react';

export interface HeadingProps {
  formTitle: string;
  helpData?: any;
  showHeaderHelp?: boolean;
  backLink?: string;
  headerHelp?: string;
  button?: {
    show: boolean;
    label: string;
    action: any;
    icon?: any;
    loading?: boolean;
  };
}

export const Heading = ({ formTitle, helpData, showHeaderHelp = true, backLink, headerHelp, button }: HeadingProps) => {
  const navigate = useNavigate();
  const addIcon = <AddIcon className={styles.AddIcon} />;

  return (
    <div className={styles.Heading} data-testid="heading">
      <div className={styles.HeadingWrapper}>
        <div className={styles.BackIcon}>
          {backLink && <BackIcon onClick={() => navigate(backLink)} data-testid="back-button" />}
        </div>
        <div>
          <div className={styles.HeadingTitle}>
            <div data-testid="headerTitle" className={styles.TitleText}>
              {formTitle}
            </div>
            {helpData ? <HelpIcon helpData={helpData} /> : ''}
          </div>
          <div className={styles.TextHeading}>{showHeaderHelp ? headerHelp || `Please enter below details.` : ''}</div>
        </div>
      </div>
      {button && button.show && (
        <div>
          <Button
            className={styles.Button}
            color="primary"
            variant="contained"
            onClick={() => button.action && button.action()}
            data-testid="headingButton"
            loading={button.loading}
          >
            {button.icon || addIcon} {button.label}
          </Button>
        </div>
      )}
    </div>
  );
};
