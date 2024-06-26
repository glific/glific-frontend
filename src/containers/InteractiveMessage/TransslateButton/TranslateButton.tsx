import { Button } from 'components/UI/Form/Button/Button';
import styles from './TranslateButton.module.css';
import TranslateIcon from 'assets/images/icons/LanguageTranslation.svg?react';
import { useEffect, useState } from 'react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';
import { useMutation } from '@apollo/client';
import {
  EXPORT_INTERACTIVE_TEMPLATE,
  IMPORT_INTERACTIVE_TEMPLATE,
  TRANSLATE_INTERACTIVE_TEMPLATE,
} from 'graphql/mutations/InteractiveMessage';
import { exportCsvFile } from 'common/utils';

export interface TranslateButtonProps {
  onSubmit: Function;
  errors: any;
  setStates: Function;
  templateId: string;
  saveClicked: boolean;
  setSaveClicked: any;
}

export const TranslateButton = ({
  errors,
  onSubmit,
  setStates,
  templateId,
  saveClicked,
  setSaveClicked,
}: TranslateButtonProps) => {
  const [showTranslateFlowModal, setShowTranslateFlowModal] = useState(false);
  const [translateOption, setTranslateOption] = useState('translate');
  const [importing, setImporting] = useState(false);

  const { t } = useTranslation();

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

  const [importInteractiveTemplate, { loading: importingLoad }] = useMutation(
    IMPORT_INTERACTIVE_TEMPLATE,
    {
      onCompleted: ({ importInteractiveTemplate }) => {
        console.log(importInteractiveTemplate);
        setImporting(false);
      },
    }
  );

  const handleClick = () => {
    if (Object.keys(errors).length > 0) {
      return;
    }
    setShowTranslateFlowModal(true);
  };

  const handleTranslate = async () => {
    await onSubmit();
  };

  useEffect(() => {
    if (saveClicked) {
      if (translateOption === 'translate') {
        translateInteractiveMessage({ variables: { translateInteractiveTemplateId: templateId } });
      } else if (translateOption === 'export') {
        exportInteractiveMessage({ variables: { exportInteractiveTemplateId: templateId } });
      }
    }
  }, [saveClicked]);

  const handleChange = (event: any) => {
    setTranslateOption(event.target.value);
  };

  const translationOptions = [
    {
      value: 'translate',
      label: t('Translate Interactive Message'),
      description: t('Translate the content of the Interactive Message.'),
    },
    {
      value: 'export',
      label: t('Export Interactive Template'),
      description: t('Export the content of templates.'),
    },
    {
      value: 'import',
      label: t('Import Interactive Template'),
      description: t('Import templates from a CSV file into the application.'),
    },
  ];

  const importButton = (
    <ImportButton
      title={t('Import translations')}
      onImport={() => {
        setImporting(true);
      }}
      afterImport={(result: string) => {
        importInteractiveTemplate({
          variables: { translation: result, importInteractiveTemplateId: templateId },
        });
      }}
    />
  );

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
