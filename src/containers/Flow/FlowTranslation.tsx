import { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { AUTO_TRANSLATE_FLOW, IMPORT_FLOW_LOCALIZATIONS } from 'graphql/mutations/Flow';
import { EXPORT_FLOW_LOCALIZATIONS } from 'graphql/queries/Flow';
import { setNotification } from 'common/notification';
import { exportCsvFile } from 'common/utils';

import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import { Loading } from 'components/UI/Layout/Loading/Loading';

export interface FlowTranslationProps {
  flowId: string | undefined;
  setDialog: any;
}

export const FlowTranslation = ({ flowId, setDialog }: FlowTranslationProps) => {
  const [action, setAction] = useState('auto');
  const [importing, setImporting] = useState(false);

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

  const [importFlow] = useMutation(IMPORT_FLOW_LOCALIZATIONS, {
    onCompleted: (result: any) => {
      setImporting(false);
      setDialog(false);
      refreshPage();
    },
  });

  const handleAuto = () => {
    autoTranslateFlow({ variables: { id: flowId } });
    refreshPage();
  };

  const handleExport = async () => {
    exportFlowTranslations({ variables: { id: flowId } });
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const handleOk = () => {
    if (action === 'auto') {
      handleAuto();
    } else if (action === 'export') {
      handleExport();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAction((event.target as HTMLInputElement).value);
  };

  const importButton = (
    <ImportButton
      title={t('Import translations')}
      onImport={() => setImporting(true)}
      afterImport={(result: string) =>
        importFlow({ variables: { localization: result, id: flowId } })
      }
    />
  );

  if (importing) {
    return <Loading message="Uploading" />;
  }

  const dialogContent = (
    <div>
      <FormControl>
        <RadioGroup
          aria-labelledby="radio-buttons-group"
          name="radio-buttons-group"
          value={action}
          onChange={handleChange}
          data-testid="translation-options"
        >
          <FormControlLabel value="auto" control={<Radio />} label={t('Automatic translation')} />
          <FormControlLabel value="export" control={<Radio />} label={t('Export translations')} />
          <FormControlLabel value="import" control={<Radio />} label={t('Import translations')} />
        </RadioGroup>
        {action === 'import' ? importButton : ''}
      </FormControl>
    </div>
  );

  return (
    <DialogBox
      title="Translate Flow"
      alignButtons="center"
      buttonOk="Submit"
      buttonCancel="Cancel"
      handleOk={handleOk}
      handleCancel={() => {
        setDialog(false);
      }}
      skipOk={action === 'import'}
    >
      {dialogContent}
    </DialogBox>
  );
};

export default FlowTranslation;
