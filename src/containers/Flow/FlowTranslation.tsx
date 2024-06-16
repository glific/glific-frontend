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
  FormHelperText,
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

export const BackdropLoader = ({ text }: any) => (
  <Backdrop className={styles.BackDrop} open>
    {text} <CircularProgress color="inherit" />
  </Backdrop>
);

export const FlowTranslation = ({ flowId, setDialog, loadFlowEditor }: FlowTranslationProps) => {
  const [action, setAction] = useState('auto');
  const [importing, setImporting] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState<any>(null);

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
    onError: () => {
      setDialog(false);
      setNotification(t('An error occured while translating flows.'));
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
    exportFlowTranslations({ variables: { id: flowId, addTranslation: false } });
  };

  const handleAutoExport = () => {
    exportFlowTranslations({ variables: { id: flowId, addTranslation: true } });
  };

  const handleOk = () => {
    if (action === 'auto' || action === 'export-auto') {
      setAutoTranslate(action);
    } else {
      handleExport();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAction((event.target as HTMLInputElement).value);
  };

  const handleAutoTranslate = () => {
    if (autoTranslate === 'auto') {
      handleAuto();
    } else if (autoTranslate === 'export-auto') {
      handleAutoExport();
    }
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

  const translationOptions = [
    {
      value: 'auto',
      label: t('Automatic translation'),
      description: t('Generate translations for all available languages automatically.'),
    },
    {
      value: 'export-auto',
      label: t('Export with auto translate'),
      description: t('Translate the content and export it as a CSV file.'),
    },
    {
      value: 'export',
      label: t('Export translations'),
      description: t('Export the content without any automatic translations.'),
    },
    {
      value: 'import',
      label: t('Import translations'),
      description: t('Import translations from a CSV file into the application.'),
    },
  ];

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
          {translationOptions.map((option) => (
            <div key={option.value}>
              <FormControlLabel
                value={option.value}
                control={<Radio className={styles.Radio} />}
                label={option.label}
              />
              <FormHelperText className={styles.FormHelper}>{option.description}</FormHelperText>
            </div>
          ))}
        </RadioGroup>
        {action === 'import' ? importButton : ''}
      </FormControl>
    </div>
  );

  let autoTranslateWarningDialog;
  if (autoTranslate) {
    autoTranslateWarningDialog = (
      <DialogBox
        title="Please Note"
        alignButtons="center"
        buttonOk="Continue"
        buttonCancel="Cancel"
        handleOk={handleAutoTranslate}
        handleCancel={() => {
          setAutoTranslate(null);
        }}
      >
        <p className={styles.DialogContent}>
          Auto translate only adds translation in languages nodes which are empty. To get the latest
          translations of updated content in your default language flow, please clear the nodes in
          the language nodes.
        </p>
      </DialogBox>
    );
  }

  let flowTranslationDialog = (
    <DialogBox
      title="Translate Options"
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

  return (
    <>
      {flowTranslationDialog}
      {autoTranslateWarningDialog}
    </>
  );
};

export default FlowTranslation;
