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
import { setErrorMessage } from 'common/notification';

import TranslateIcon from 'assets/images/icons/LanguageTranslation.svg?react';

import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';

import styles from './TranslateButton.module.css';

export interface TranslateButtonProps {
  form: { setTouched: any; errors: any };
  onSubmit: () => Promise<void>;
  setStates: (interactiveMessage: any) => {};
  templateId: string;
  saveClicked: boolean;
  setSaveClicked: any;
  defaultLanguage: any;
  language: any;
}

export const TranslateButton = ({
  onSubmit,
  setStates,
  templateId,
  saveClicked,
  setSaveClicked,
  form: { setTouched, errors },
  defaultLanguage,
  language,
}: TranslateButtonProps) => {
  const [showTranslateFlowModal, setShowTranslateFlowModal] = useState(false);
  const [translateOption, setTranslateOption] = useState('translate');
  const [importing, setImporting] = useState(false);

  const { t } = useTranslation();
  console.log(defaultLanguage?.id, language?.id);

  const translationOptions = [
    {
      value: 'translate',
      label: t('Translate Interactive Message'),
      description: t('Translate the content of the Interactive Message.'),
    },
    {
      value: 'export-translate',
      label: t('Export Interactive Template With Translations'),
      description: t('Export the translated content of templates as a csv.'),
    },
    {
      value: 'export',
      label: t('Export Interactive Template Without Translations'),
      description: t('Export the content without any translations.'),
    },
    {
      value: 'import',
      label: t('Import Interactive Template'),
      description: t('Import templates from a CSV file into the application.'),
    },
  ];

  const [translateInteractiveMessage, { loading }] = useMutation(TRANSLATE_INTERACTIVE_TEMPLATE, {
    onCompleted: ({ translateInteractiveTemplate }: any) => {
      const interactiveMessage = translateInteractiveTemplate?.interactiveTemplate;
      setStates(interactiveMessage);
      setShowTranslateFlowModal(false);
      setSaveClicked(false);
    },
  });

  const [exportInteractiveMessage, { loading: exportLoading }] = useMutation(
    EXPORT_INTERACTIVE_TEMPLATE,
    {
      onCompleted: ({ exportInteractiveTemplate }) => {
        const { exportData } = exportInteractiveTemplate;
        exportCsvFile(exportData, `Interactive_Message_Translations_${templateId}`);
        setShowTranslateFlowModal(false);
        setSaveClicked(false);
      },
    }
  );

  const [importInteractiveMessage, { loading: importingLoad }] = useMutation(
    IMPORT_INTERACTIVE_TEMPLATE,
    {
      onCompleted: ({ importInteractiveTemplate }) => {
        const interactiveMessage = importInteractiveTemplate?.interactiveTemplate;
        setStates(interactiveMessage);
        setImporting(false);
        setShowTranslateFlowModal(false);
        setSaveClicked(false);
      },
      onError: (error: any) => {
        setImporting(false);
        setShowTranslateFlowModal(false);
        setSaveClicked(false);
        setErrorMessage(error);
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
    setSaveClicked(false);
    if (Object.keys(errors).length > 0 && defaultLanguage?.id === language?.id) {
      const touched = {};
      Object.keys(errors).forEach((key) => Object.assign(touched, { [key]: true }));
      setTouched(touched);
      return;
    }
    setShowTranslateFlowModal(true);
  };

  const handleChange = (event: any) => {
    setTranslateOption(event.target.value);
  };

  const handleTranslate = async () => {
    if (defaultLanguage?.id !== language?.id && templateId) {
      setSaveClicked(true);
    } else {
      await onSubmit();
    }
  };

  useEffect(() => {
    if (saveClicked && showTranslateFlowModal) {
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
    }
  }, [saveClicked]);

  const dialog = (
    <DialogBox
      title="Translate Options"
      alignButtons="center"
      buttonOk="Continue"
      handleOk={handleTranslate}
      buttonOkLoading={loading || exportLoading || importing || importingLoad}
      buttonCancel="Cancel"
      handleCancel={() => {
        setShowTranslateFlowModal(false);
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

  return (
    <div className={styles.Wrapper}>
      <Button variant="outlined" color="primary" data-testid="previewButton" onClick={handleClick}>
        <TranslateIcon className={styles.Icon} />
        Translate
      </Button>
      {showTranslateFlowModal ? dialog : ''}
    </div>
  );
};
