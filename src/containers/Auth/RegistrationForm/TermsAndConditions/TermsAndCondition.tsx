import { Dialog } from '@mui/material';

import styles from './TermsAndConditions.module.css';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/UI/Form/Button/Button';

interface TermsAndConditionsProps {
  open: boolean;
  setOpen: Function;
  setTermsAgreed: Function;
  openReachOutToUs?: Function;
}

export const TermsAndConditions = ({
  open,
  setOpen,
  setTermsAgreed,
  openReachOutToUs,
}: TermsAndConditionsProps) => {
  const { t } = useTranslation();

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      classes={{
        paper: styles.DialogboxPaper,
      }}
      maxWidth="lg"
      fullWidth={true}
      open={open}
      onClose={handleClose}
    >
      <div className={styles.Container}>
        <h1 className={styles.Heading}>Terms and conditions</h1>

        <div className={styles.TermsAndCondition}></div>

        <div className={styles.Buttons}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              if (openReachOutToUs) openReachOutToUs(true);
            }}
          >
            I Disagree
          </Button>
          <Button
            variant="contained"
            color="primary"
            data-testid="previewButton"
            onClick={() => {
              setTermsAgreed(true);
              setOpen(false);
            }}
          >
            I Agree
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
