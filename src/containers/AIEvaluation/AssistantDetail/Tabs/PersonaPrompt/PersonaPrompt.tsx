import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BetaTag } from 'components/UI/BetaTag/BetaTag';
import { SegmentedControl } from 'components/UI/SegmentedControl/SegmentedControl';
import { setNotification } from 'common/notification';
import { getOrganizationServices } from 'services/AuthService';
import {
  ASSISTANT_MODELS,
  EFFORT_HINTS,
  ModelConfig,
  ReasoningEffort,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
  VERBOSITY_OPTIONS,
  Verbosity,
  getModel,
  getModelParams,
} from '../../assistantModels';
import {
  PromptAnswers,
  PromptGeneratorModal,
  initialPromptAnswers,
} from 'containers/Assistants/CreateAssistant/PromptGeneratorModal';
import styles from './PersonaPrompt.module.css';

export interface PersonaPromptProps {
  prompt: string;
  config: ModelConfig;
  onPromptChange: (prompt: string) => void;
  onConfigChange: (config: ModelConfig) => void;
}

export const PersonaPrompt = ({ prompt, config, onPromptChange, onConfigChange }: PersonaPromptProps) => {
  const { t } = useTranslation();

  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [answers, setAnswers] = useState<PromptAnswers>(initialPromptAnswers);

  const isPromptGeneratorEnabled = getOrganizationServices('promptGeneratorEnabled');

  const selectedModel = getModel(config.model);
  const params = getModelParams(config);

  const handleModelChange = (id: string) => {
    const previous = getModel(config.model);
    const next = getModel(id);
    const updated: ModelConfig = {
      ...config,
      model: id,
      effort: next.kind === 'reasoning' ? (next.defaultEffort ?? config.effort) : config.effort,
    };

    onConfigChange(updated);

    // switching to a reasoning model silently drops temperature, so say so
    if (previous.kind !== 'reasoning' && next.kind === 'reasoning' && !getModelParams(updated).temperature) {
      setNotification(t('Temperature is not supported on reasoning models — use reasoning effort and verbosity.'));
    }
  };

  const handleTemperatureChange = (value: string) => {
    if (value === '') {
      onConfigChange({ ...config, temperature: '' });
      return;
    }

    const parsed = Number(value);
    let temperature = value;
    if (parsed > TEMPERATURE_MAX) temperature = String(TEMPERATURE_MAX);
    else if (parsed < TEMPERATURE_MIN) temperature = String(TEMPERATURE_MIN);

    onConfigChange({ ...config, temperature });
  };

  const handleEffortChange = (effort: ReasoningEffort) => {
    onConfigChange({ ...config, effort });
    if (effort === 'none') {
      setNotification(t('Reasoning off — temperature is available again.'));
    }
  };

  // effort and verbosity levels double as translation keys, so they render directly
  const segmentOptions = <T extends ReasoningEffort | Verbosity>(values: T[]) =>
    values.map((value) => ({ value, label: t(value) }));

  const fieldLabel = (text: ReactNode, apiName: string) => (
    <>
      {text}
      <span className={styles.ApiName}>{apiName}</span>
    </>
  );

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
            <span className={styles.Sparkle}>✦</span>
            {t('Generate with AI')}
            <BetaTag size="small" className={styles.GenerateBeta} />
          </button>
        )}
      </div>

      <textarea
        className={styles.TextArea}
        rows={6}
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder={t(
          'Describe who this assistant is, what it helps with, what it must never do, and what language it should reply in…'
        )}
        data-testid="promptInput"
      />

      <div className={styles.Divider} />

      <div className={styles.FieldLabel}>{t('Model')}</div>
      <select
        className={styles.Field}
        value={config.model}
        onChange={(event) => handleModelChange(event.target.value)}
        data-testid="modelSelect"
      >
        {ASSISTANT_MODELS.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.label}
            {entry.kind === 'reasoning' ? ` · ${t('reasoning')}` : ''}
          </option>
        ))}
      </select>
      <div className={styles.Note} data-testid="modelBlurb">
        {t(selectedModel.blurb)}
      </div>

      <div className={styles.ParamCard} data-testid="modelParams">
        <div className={styles.ParamTitle}>
          {t('Settings for')} {selectedModel.label}
        </div>

        {(params.effort || params.verbosity) && (
          <div className={styles.ParamColumns}>
            {params.effort && (
              <SegmentedControl
                className={styles.ParamColumn}
                trackClassName={styles.SegmentTrack}
                testId="effortSegment"
                label={fieldLabel(t('Reasoning effort'), 'reasoning_effort')}
                labelClassName={styles.FieldLabel}
                options={segmentOptions(selectedModel.efforts ?? [])}
                value={config.effort}
                onChange={handleEffortChange}
                helperText={t(EFFORT_HINTS[config.effort])}
              />
            )}

            {params.verbosity && (
              <SegmentedControl
                className={styles.ParamColumn}
                trackClassName={styles.SegmentTrack}
                testId="verbositySegment"
                label={fieldLabel(t('Verbosity'), 'verbosity')}
                labelClassName={styles.FieldLabel}
                options={segmentOptions(VERBOSITY_OPTIONS)}
                value={config.verbosity}
                onChange={(verbosity: Verbosity) => onConfigChange({ ...config, verbosity })}
                helperText={t('How long the replies run. Low suits WhatsApp, where long messages get truncated.')}
              />
            )}
          </div>
        )}

        {params.temperature && (
          <div>
            <div className={styles.FieldLabel}>
              {t('Temperature')}
              <span className={styles.ApiName}>temperature</span>
            </div>
            <input
              className={styles.Field}
              type="number"
              min={TEMPERATURE_MIN}
              max={TEMPERATURE_MAX}
              step={0.01}
              value={config.temperature}
              onChange={(event) => handleTemperatureChange(event.target.value)}
              data-testid="temperatureInput"
            />
            <div className={styles.Note}>{t('Lower = more predictable. Keep near 0 for factual assistants.')}</div>
          </div>
        )}
      </div>

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
