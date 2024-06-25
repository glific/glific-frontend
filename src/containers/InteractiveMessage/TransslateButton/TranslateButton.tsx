import { Button } from 'components/UI/Form/Button/Button';
import styles from './TranslateButton.module.css';
import TranslateIcon from 'assets/images/icons/LanguageTranslation.svg?react';
import { useState } from 'react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ImportButton } from 'components/UI/ImportButton/ImportButton';

export interface TranslateButtonProps {
  onSubmit: Function;
  errors: any;
  setTranslateType: Function;
}

export const TranslateButton = ({ errors, onSubmit, setTranslateType }: TranslateButtonProps) => {
  const [showTranslateFlowModal, setShowTranslateFlowModal] = useState(false);
  const [translateOption, setTranslateOption] = useState('translate');

  const { t } = useTranslation();

  const handleClick = () => {
    if (Object.keys(errors).length > 0) {
      return;
    }
    setShowTranslateFlowModal(true);
  };

  const handleTranslate = () => {
    onSubmit();
    setTranslateType(translateOption);
  };

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
      onImport={() => {}}
      afterImport={
        (result: string) => {}
        // importFlow({ variables: { localization: result, id: flowId } })
      }
    />
  );

  const dialog = (
    <DialogBox
      title="Translate Options"
      alignButtons="center"
      buttonOk="Continue"
      buttonCancel="Cancel"
      handleOk={handleTranslate}
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
