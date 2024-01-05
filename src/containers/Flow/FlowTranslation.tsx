import { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import styles from './FlowTranslation.module.css';
import { AUTO_TRANSLATE_FLOW, IMPORT_FLOW_LOCALIZATIONS } from 'graphql/mutations/Flow';
import { EXPORT_FLOW_LOCALIZATIONS } from 'graphql/queries/Flow';
import { setNotification } from 'common/notification';
import { exportCsvFile } from 'common/utils';

import { ImportButton } from 'components/UI/ImportButton/ImportButton';

export interface FlowTranslationProps {
  flowId: string | undefined;
  setDialog: any;
  loadFlowEditor: any;
}

const BackdropLoader = ({ text }: any) => (
  <Backdrop className={styles.BackDrop} open>
    {text} <CircularProgress color="inherit" />
  </Backdrop>
);

export const FlowTranslation = ({ flowId, setDialog, loadFlowEditor }: FlowTranslationProps) => {
  const [action, setAction] = useState('auto');
  const [importing, setImporting] = useState(false);

  const { t } = useTranslation();

  const [autoTranslateFlow, { loading }] = useMutation(AUTO_TRANSLATE_FLOW, {
    onCompleted: ({ inlineFlowLocalization }) => {
      if (inlineFlowLocalization.success) {
        setDialog(false);
        setNotification(t('Flow has been translated successfully'));
        loadFlowEditor();
      } else if (inlineFlowLocalization.errors) {
        setDialog(false);
        setNotification(inlineFlowLocalization.errors[0].message, 'warning');
      }
    },
  });

  const [exportFlowTranslations, { loading: exportLoad }] = useLazyQuery(
    EXPORT_FLOW_LOCALIZATIONS,
    {
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
    }
  );

  const [importFlow, { loading: importingLoad }] = useMutation(IMPORT_FLOW_LOCALIZATIONS, {
    onCompleted: (result: any) => {
      setImporting(false);
      setDialog(false);
      loadFlowEditor();
    },
  });

  const handleAuto = () => {
    autoTranslateFlow({ variables: { id: flowId } });
  };

  const handleExport = async () => {
    exportFlowTranslations({ variables: { id: flowId } });
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
    return <BackdropLoader text="Uploading..." />;
  }

  if (exportLoad) {
    return <BackdropLoader text="Exporting. Please wait..." />;
  }

  if (loading || importingLoad) {
    return <BackdropLoader text="Please wait while the flow is getting translated..." />;
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
