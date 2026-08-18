import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Slider } from '@mui/material';
import { BetaTag } from 'components/UI/BetaTag/BetaTag';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandIcon from 'assets/images/icons/ExpandContent.svg?react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { Input } from 'components/UI/Form/Input/Input';
import { SegmentedControl } from 'components/UI/SegmentedControl/SegmentedControl';
import { setNotification } from 'common/notification';
import { getOrganizationServices } from 'services/AuthService';
import type { AssistantModel, ModelConfig, ModelParamSpec } from 'containers/AIEvaluation/types/assistantType';
import { configForModel, getModel, getParamSpec } from '../../assistantModels';
import {
  PromptAnswers,
  PromptGeneratorModal,
  initialPromptAnswers,
} from 'containers/Assistants/CreateAssistant/PromptGeneratorModal';
import styles from './PersonaPrompt.module.css';

export interface PersonaPromptProps {
  prompt: string;
  config: ModelConfig;
  models: AssistantModel[];
  onPromptChange: (prompt: string) => void;
  onConfigChange: (config: ModelConfig) => void;
}

export const PersonaPrompt = ({ prompt, config, models, onPromptChange, onConfigChange }: PersonaPromptProps) => {
  const { t } = useTranslation();

  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState('');
  const [answers, setAnswers] = useState<PromptAnswers>(initialPromptAnswers);

  const isPromptGeneratorEnabled = getOrganizationServices('promptGeneratorEnabled');

  const selectedModel = getModel(models, config.model);
  const temperatureSpec = getParamSpec(selectedModel, 'temperature');
  const effortSpec = getParamSpec(selectedModel, 'effort');

  const modelOptions = models.map((model) => ({ id: model.modelName, label: model.modelName }));

  const handleModelChange = (modelName: string) => {
    const next = getModel(models, modelName);
    onConfigChange(configForModel(next, config));

    if (temperatureSpec && !getParamSpec(next, 'temperature')) {
      setNotification(t('This model does not take a temperature — use the settings it offers instead.'));
    }
  };

  const handleTemperatureChange = (value: string | number) => {
    // an emptied box means "leave temperature out", which the save payload honours
    if (value === '') {
      onConfigChange({ ...config, temperature: '' });
      return;
    }

    const min = temperatureSpec?.min ?? 0;
    const max = temperatureSpec?.max ?? 2;
    const temperature = Math.min(max, Math.max(min, Number(value)));

    onConfigChange({ ...config, temperature: String(temperature) });
  };

  const segmentOptions = (spec: ModelParamSpec) => (spec.options ?? []).map((value) => ({ value, label: value }));

  return (
    <div className={styles.Card} data-testid="personaPrompt">
      <div className={styles.PromptHeader}>
        <div className={styles.FieldLabel}>{t('Instructions (Prompt)')}</div>
        {isPromptGeneratorEnabled && (
          <button
            type="button"
            className={styles.GenerateButton}
            onClick={() => setGeneratorOpen(true)}
            data-testid="generateWithAiButton"
          >
            <AutoAwesomeIcon className={styles.Sparkle} />
            {t('Generate with AI')}
            <BetaTag size="small" className={styles.GenerateBeta} />
          </button>
        )}
      </div>

      <Input
        textArea
        rows={6}
        endAdornment={
          <InputAdornment className={styles.Expand} position="end">
            <ExpandIcon
              className={styles.ExpandButton}
              onClick={() => {
                setDraft(prompt);
                setExpanded(true);
              }}
              aria-label={t('Edit system instructions')}
              data-testid="expandPromptButton"
            />
          </InputAdornment>
        }
        placeholder={t(
          'Describe who this assistant is, what it helps with, what it must never do, and what language it should reply in…'
        )}
        field={{ name: 'prompt', value: prompt, onBlur: () => {} }}
        onChange={onPromptChange}
        inputProp={{ 'data-testid': 'promptInput' }}
      />

      <div className={styles.Divider} />

      <div className={styles.FieldLabel}>{t('Model')}</div>
      <Dropdown
        placeholder=""
        options={modelOptions}
        field={{
          name: 'model',
          value: config.model,
          onChange: (event: { target: { value: string } }) => handleModelChange(event.target.value),
        }}
      />

      {selectedModel && (
        <div className={styles.ParamCard} data-testid="modelParams">
          <div className={styles.ParamTitle}>
            {t('Settings for')} {selectedModel.modelName}
          </div>

          {effortSpec && (
            <div className={styles.ParamColumns}>
              <SegmentedControl
                className={styles.ParamColumn}
                testId="effortSegment"
                label={t('Reasoning effort')}
                labelClassName={styles.FieldLabel}
                options={segmentOptions(effortSpec)}
                value={config.effort}
                onChange={(effort: string) => onConfigChange({ ...config, effort })}
                helperText={effortSpec.description}
              />
            </div>
          )}

          {temperatureSpec && (
            <div>
              <div className={styles.FieldLabel}>{t('Temperature')}</div>
              <div className={styles.TemperatureRow}>
                <Slider
                  className={styles.TemperatureSlider}
                  value={Number(config.temperature) || (temperatureSpec.min ?? 0)}
                  min={temperatureSpec.min ?? 0}
                  max={temperatureSpec.max ?? 2}
                  step={0.01}
                  onChange={(_, value) => handleTemperatureChange(Number(value))}
                  data-testid="temperatureSlider"
                />
                <input
                  type="number"
                  className={styles.TemperatureValue}
                  value={config.temperature}
                  min={temperatureSpec.min ?? 0}
                  max={temperatureSpec.max ?? 2}
                  step={0.01}
                  onChange={(event) => handleTemperatureChange(event.target.value)}
                  data-testid="temperatureInput"
                />
              </div>
              <div className={styles.Note}>{temperatureSpec.description}</div>
            </div>
          )}

          {!effortSpec && !temperatureSpec && (
            <div className={styles.Note} data-testid="noModelParams">
              {t('This model has no settings to tune.')}
            </div>
          )}
        </div>
      )}

      {expanded && (
        <DialogBox
          open
          titleAlign="left"
          title={t('Edit system instructions')}
          buttonOk={t('Save')}
          buttonCancel={t('Cancel')}
          alignButtons="right"
          handleOk={() => {
            onPromptChange(draft);
            setExpanded(false);
          }}
          handleCancel={() => setExpanded(false)}
          fullWidth
          customStyles={{ paper: styles.ExpandedPaper }}
        >
          <Input
            textArea
            rows={16}
            placeholder={t(
              'Describe who this assistant is, what it helps with, what it must never do, and what language it should reply in…'
            )}
            field={{ name: 'promptExpanded', value: draft, onBlur: () => {} }}
            onChange={setDraft}
            inputProp={{ 'data-testid': 'promptExpandedInput' }}
          />
        </DialogBox>
      )}

      {generatorOpen && (
        <PromptGeneratorModal
          open={generatorOpen}
          onClose={() => setGeneratorOpen(false)}
          onApply={(text: string) => {
            onPromptChange(text);
            setGeneratorOpen(false);
          }}
          answers={answers}
          setAnswers={setAnswers}
        />
      )}
    </div>
  );
};

export default PersonaPrompt;
