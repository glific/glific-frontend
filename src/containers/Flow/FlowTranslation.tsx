import { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { AUTO_TRANSLATE_FLOW } from 'graphql/mutations/Flow';
import { EXPORT_FLOW_LOCALIZATIONS } from 'graphql/queries/Flow';
import { setNotification } from 'common/notification';
import { exportCsvFile } from 'common/utils';

import styles from './FlowTranslation.module.css';

export interface FlowTranslationProps {
  flowId: string | undefined;
  setDialog: any;
}

export const FlowTranslation = ({ flowId, setDialog }: FlowTranslationProps) => {
  const [action, setAction] = useState('auto');

  const { t } = useTranslation();

  const [autoTranslateFlow] = useMutation(AUTO_TRANSLATE_FLOW, {
    onCompleted: ({ inlineFlowLocalization }) => {
      if (inlineFlowLocalization.success) {
        setDialog(false);
        setNotification(t('Flow has been translated successfully'));
      } else if (inlineFlowLocalization.errors) {
        setDialog(false);
        setNotification(inlineFlowLocalization.errors[0].message, 'warning');
      }
    },
  });

  const [exportFlowTranslations] = useLazyQuery(EXPORT_FLOW_LOCALIZATIONS, {
    fetchPolicy: 'network-only',
    onCompleted: async ({ exportFlowLocalization }) => {
      const { exportData } = exportFlowLocalization;
      exportCsvFile(exportData, `Flow_Translations_${flowId}`);
      setDialog(false);
    },
    onError: (error) => {
      setDialog(false);
      setNotification(t('An error occured while exporting flow translations'), 'warning');
    },
  });

  const handleAuto = () => {
    autoTranslateFlow({ variables: { id: flowId } });
  };

  const handleExport = async () => {
    exportFlowTranslations({ variables: { id: flowId } });
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
