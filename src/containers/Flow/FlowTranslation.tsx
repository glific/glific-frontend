import { useState } from 'react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import styles from './FlowTranslation.module.css';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface FlowTranslationProps {
  flowId: string | undefined;
  setDialog: any;
}

export const FlowTranslation = ({ flowId, setDialog }: FlowTranslationProps) => {
  const [action, setAction] = useState('auto');

  const { t } = useTranslation();

  const handleAuto = () => {
    console.log('handle auto');
  };
  const handleExport = () => {
    console.log('handle export');
  };

  const handleImport = () => {
    console.log('handle import');
  };

  const handleOk = () => {
    if (action === 'auto') {
      handleAuto();
    } else if (action === 'export') {
      handleExport();
    } else {
      handleImport();
    }

    setDialog(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAction((event.target as HTMLInputElement).value);
  };

  const dialogContent = (
    <div>
      <FormControl>
        <RadioGroup
          aria-labelledby="radio-buttons-group"
          name="radio-buttons-group"
          value={action}
          onChange={handleChange}
        >
          <FormControlLabel value="auto" control={<Radio />} label={t('Automatic translation')} />
          <FormControlLabel value="export" control={<Radio />} label={t('Export translations')} />
          <FormControlLabel value="import" control={<Radio />} label={t('Import translations')} />
        </RadioGroup>
      </FormControl>
    </div>
  );

  return (
    <DialogBox
      title="Translate Flow"
      alignButtons="center"
      buttonOk="Submit"
      buttonCancel="Cancel"
      additionalTitleStyles={styles.Title}
      handleOk={handleOk}
      handleCancel={() => {
        setDialog(false);
      }}
    >
      {dialogContent}
    </DialogBox>
  );
};

export default FlowTranslation;
