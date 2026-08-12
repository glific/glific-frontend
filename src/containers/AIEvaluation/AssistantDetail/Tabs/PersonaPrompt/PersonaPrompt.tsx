import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BetaTag } from 'components/UI/BetaTag/BetaTag';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { Input } from 'components/UI/Form/Input/Input';
import { SegmentedControl } from 'components/UI/SegmentedControl/SegmentedControl';
import { setNotification } from 'common/notification';
import { getOrganizationServices } from 'services/AuthService';
import type { KaapiModel, ModelConfig, ModelParamSpec } from 'containers/AIEvaluation/types/assistantType';
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
  models: KaapiModel[];
  onPromptChange: (prompt: string) => void;
  onConfigChange: (config: ModelConfig) => void;
}

export const PersonaPrompt = ({ prompt, config, models, onPromptChange, onConfigChange }: PersonaPromptProps) => {
  const { t } = useTranslation();

  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [answers, setAnswers] = useState<PromptAnswers>(initialPromptAnswers);

  const isPromptGeneratorEnabled = getOrganizationServices('promptGeneratorEnabled');

  const selectedModel = getModel(models, config.model);
  const temperatureSpec = getParamSpec(selectedModel, 'temperature');
  const effortSpec = getParamSpec(selectedModel, 'effort');
  const verbositySpec = getParamSpec(selectedModel, 'verbosity');

  const modelOptions = models.map((model) => ({ id: model.modelName, label: model.modelName }));

  const handleModelChange = (modelName: string) => {
    const next = getModel(models, modelName);
    if (!next) return;

    // each model declares its own settings and defaults, so carrying the old values over
    // would leave the form holding numbers the new model does not accept
    onConfigChange(configForModel(next, config));

    if (temperatureSpec && !next.config.temperature) {
      setNotification(t('This model does not take a temperature — use the settings it offers instead.'));
    }
  };

  const handleTemperatureChange = (value: string) => {
    if (value === '') {
      onConfigChange({ ...config, temperature: '' });
      return;
    }

    const parsed = Number(value);
    const min = temperatureSpec?.min ?? 0;
    const max = temperatureSpec?.max ?? 2;

    let temperature = value;
    if (parsed > max) temperature = String(max);
    else if (parsed < min) temperature = String(min);

    onConfigChange({ ...config, temperature });
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

          {(effortSpec || verbositySpec) && (
            <div className={styles.ParamColumns}>
              {effortSpec && (
                <SegmentedControl
                  className={styles.ParamColumn}
                  trackClassName={styles.SegmentTrack}
                  testId="effortSegment"
                  label={t('Reasoning effort')}
                  labelClassName={styles.FieldLabel}
                  options={segmentOptions(effortSpec)}
                  value={config.effort}
                  onChange={(effort: string) => onConfigChange({ ...config, effort })}
                  helperText={effortSpec.description}
                />
              )}

              {verbositySpec && (
                <SegmentedControl
                  className={styles.ParamColumn}
                  trackClassName={styles.SegmentTrack}
                  testId="verbositySegment"
                  label={t('Verbosity')}
                  labelClassName={styles.FieldLabel}
                  options={segmentOptions(verbositySpec)}
                  value={config.verbosity}
                  onChange={(verbosity: string) => onConfigChange({ ...config, verbosity })}
                  helperText={verbositySpec.description}
                />
              )}
            </div>
          )}

          {temperatureSpec && (
            <div>
              <div className={styles.FieldLabel}>{t('Temperature')}</div>
              <Input
                type="number"
                placeholder=""
                field={{ name: 'temperature', value: config.temperature, onBlur: () => {} }}
                onChange={handleTemperatureChange}
                inputProp={{
                  min: temperatureSpec.min,
                  max: temperatureSpec.max,
                  step: 0.01,
                  'data-testid': 'temperatureInput',
                }}
              />
              <div className={styles.Note}>{temperatureSpec.description}</div>
            </div>
          )}

          {!effortSpec && !verbositySpec && !temperatureSpec && (
            <div className={styles.Note} data-testid="noModelParams">
              {t('This model has no settings to tune.')}
            </div>
          )}
        </div>
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
