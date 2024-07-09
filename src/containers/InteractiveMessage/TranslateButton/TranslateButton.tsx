import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from '@mui/material';
import { useMutation } from '@apollo/client';

import {
  EXPORT_INTERACTIVE_TEMPLATE,
  IMPORT_INTERACTIVE_TEMPLATE,
  TRANSLATE_INTERACTIVE_TEMPLATE,
} from 'graphql/mutations/InteractiveMessage';

import { exportCsvFile } from 'common/utils';
import { setErrorMessage, setNotification } from 'common/notification';

import TranslateIcon from 'assets/images/icons/LanguageTranslation.svg?react';

import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';

import styles from './TranslateButton.module.css';

export interface TranslateButtonProps {
  onSubmit: () => Promise<void>;
  form: { setTouched: any; errors: any };
  setStates: (interactiveMessage: any) => object;
  templateId: string;
  saveClicked: any;
  setSaveClicked: any;
}

export const TranslateButton = ({
  form: { errors, setTouched },
  onSubmit,
  setStates,
  templateId,
  saveClicked,
  setSaveClicked,
}: TranslateButtonProps) => {
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [translateOption, setTranslateOption] = useState('translate');
  const [importing, setImporting] = useState(false);
  const [translateMessage, setTranslateMessage] = useState(null);

  const { t } = useTranslation();

  const translationOptions = [
    {
      value: 'translate',
      label: t('Auto translate'),
      description: t('Translate the content of interactive message.'),
    },
    {
      value: 'export-translate',
      label: t('Export with translations'),
      description: t('Export the translated content of the message as a csv.'),
    },
    {
      value: 'export',
      label: t('Export without translations'),
      description: t('Export the content of the message as a csv.'),
    },
    {
      value: 'import',
      label: t('Import translations'),
      description: t('Import the csv with translations for interactive message.'),
    },
  ];

  const handleClose = () => {
    setShowTranslateModal(false);
    setSaveClicked(false);
    setImporting(false);
  };

  const [translateInteractiveMessage, { loading }] = useMutation(TRANSLATE_INTERACTIVE_TEMPLATE, {
    onCompleted: ({ translateInteractiveTemplate }: any) => {
      const { interactiveTemplate, message } = translateInteractiveTemplate;
      setStates(interactiveTemplate);

      if (message) {
        setTranslateMessage(message);
      } else {
        setNotification('Interactive Message Translated Successfully', 'success');
      }

      handleClose();
    },
    onError(error: any) {
      handleClose();
      setErrorMessage(error);
    },
  });

  const [exportInteractiveMessage, { loading: exportLoading }] = useMutation(
    EXPORT_INTERACTIVE_TEMPLATE,
    {
      onCompleted: ({ exportInteractiveTemplate }) => {
        const { exportData } = exportInteractiveTemplate;
        exportCsvFile(exportData, `Interactive_Message_Translations_${templateId}`);
        setNotification('Interactive Message Exported Successfully', 'success');
        handleClose();
      },
      onError(error: any) {
        handleClose();
        setErrorMessage(error);
      },
    }
  );

  const [importInteractiveMessage, { loading: importingLoad }] = useMutation(
    IMPORT_INTERACTIVE_TEMPLATE,
    {
      onCompleted: ({ importInteractiveTemplate }) => {
        const { interactiveTemplate, message } = importInteractiveTemplate;
        setStates(interactiveTemplate);

        if (message) {
          setTranslateMessage(message);
        } else {
          setNotification('Interactive Message Imported Successfully!', 'success');
        }
        handleClose();
      },
      onError: (error: any) => {
        setErrorMessage(error);
        handleClose();
      },
    }
  );

  const importButton = (
    <ImportButton
      title={t('Import translations')}
      onImport={() => {
        setImporting(true);
      }}
      afterImport={(result: string) => {
        importInteractiveMessage({
          variables: { translation: result, importInteractiveTemplateId: templateId },
        });
      }}
    />
  );

  const handleClick = () => {
    if (!templateId && Object.keys(errors).length > 0) {
      const touched = {};
      Object.keys(errors).map((key) => Object.assign(touched, { [key]: true }));
      setTouched(touched);
      return;
    }
    setShowTranslateModal(true);
  };

  const handleChange = (event: any) => {
    setTranslateOption(event.target.value);
  };

  const handleTranslateOptions = () => {
    if (translateOption === 'translate') {
      translateInteractiveMessage({
        variables: { translateInteractiveTemplateId: templateId },
      });
    } else if (translateOption === 'export-translate') {
      exportInteractiveMessage({
        variables: { exportInteractiveTemplateId: templateId, addTranslation: true },
      });
    } else if (translateOption === 'export') {
      exportInteractiveMessage({
        variables: { exportInteractiveTemplateId: templateId, addTranslation: false },
      });
    }
  };

  const handleTranslate = async () => {
    if (templateId) {
      handleTranslateOptions();
    } else {
      setSaveClicked(true);
      await onSubmit();
    }
  };

  useEffect(() => {
    if (templateId && saveClicked) {
      handleTranslateOptions();
    }
  }, [saveClicked, templateId]);

  const dialog = (
    <DialogBox
      title="Translate Options"
      alignButtons="center"
      buttonOk="Continue"
      handleOk={handleTranslate}
      buttonOkLoading={loading || exportLoading || importing || importingLoad}
      buttonCancel="Cancel"
      handleCancel={() => {
        setShowTranslateModal(false);
      }}
      disableOk={translateOption === 'import' || importingLoad}
    >
      <div>
        <FormControl>
          <RadioGroup
            aria-labelledby="radio-buttons-group"
            name="radio-buttons-group"
            value={translateOption}
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
            {translateOption === 'import' && importButton}
          </RadioGroup>
        </FormControl>
      </div>
    </DialogBox>
  );

  let messageDialog;
  if (translateMessage) {
    messageDialog = (
      <DialogBox
        title="Translations exceeding limit."
        buttonOk="Okay"
        alignButtons="center"
        handleOk={() => setTranslateMessage(null)}
        skipCancel
      >
        <div className={styles.DialogContent}>{translateMessage}</div>
      </DialogBox>
    );
  }

  return (
    <div className={styles.Wrapper}>
      <Button variant="outlined" color="primary" data-testid="translateBtn" onClick={handleClick}>
        <TranslateIcon className={styles.Icon} />
        Translate
      </Button>
      {showTranslateModal ? dialog : ''}
      {translateMessage && messageDialog}
    </div>
  );
};
