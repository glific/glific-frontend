import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BetaTag } from 'components/UI/BetaTag/BetaTag';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandIcon from 'assets/images/icons/ExpandContent.svg?react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { IconButton } from 'components/UI/IconButton/IconButton';
import { RangeSlider } from 'components/UI/Form/RangeSlider/RangeSlider';
import { SelectMenu } from 'components/UI/SelectMenu/SelectMenu';
import { Input } from 'components/UI/Form/Input/Input';
import { SegmentedControl } from 'components/UI/SegmentedControl/SegmentedControl';
import { setNotification } from 'common/notification';
import { getOrganizationServices } from 'services/AuthService';
import type { AssistantModel, ModelConfig, ModelParamSpec } from 'containers/AIEvaluation/types/assistantType';
import { configForModel, getModel, getParamSpec, groupModelsByCategory } from '../../assistantModels';
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

  const modelOptions = groupModelsByCategory(models).flatMap((group) =>
    group.models.map((model) => ({
      id: model.modelName,
      group: t(group.label),
      testId: `modelOption-${model.modelName}`,
      label: (
        <span className={model.category === 'to_be_deprecated' ? styles.RetiringModel : ''}>{model.modelName}</span>
      ),
      endAdornment: model.badge ? (
        <span className={`${styles.ModelBadge} ${model.category === 'recommended' ? styles.RecommendedBadge : ''}`}>
          {model.badge}
        </span>
      ) : null,
    }))
  );

  const handleModelChange = (modelName: string) => {
    const next = getModel(models, modelName);
    onConfigChange(configForModel(next, config));

    if (temperatureSpec && !getParamSpec(next, 'temperature')) {
      setNotification(t('This model does not take a temperature — use the settings it offers instead.'));
    }
  };

  const handleTemperatureChange = (value: string | number) => {
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
          <span className={styles.Expand}>
            <IconButton
              size="small"
              className={styles.ExpandButton}
              onClick={() => {
                setDraft(prompt);
                setExpanded(true);
              }}
              aria-label={t('Edit system instructions')}
              data-testid="expandPromptButton"
            >
              <ExpandIcon aria-hidden="true" focusable="false" />
            </IconButton>
          </span>
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
      <SelectMenu
        testId="modelSelect"
        triggerClassName={styles.ModelTrigger}
        paperClassName={styles.ModelMenuPaper}
        matchTriggerWidth
        selectedId={config.model}
        onSelect={(option) => handleModelChange(option.id)}
        trigger={
          <>
            <span className={styles.ModelName}>{config.model}</span>
            <span className={styles.Caret} />
          </>
        }
        options={modelOptions}
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
              <RangeSlider
                className={styles.Temperature}
                value={config.temperature === '' ? '' : Number(config.temperature)}
                min={temperatureSpec.min ?? 0}
                max={temperatureSpec.max ?? 2}
                testId="temperatureSlider"
                inputTestId="temperatureInput"
                onChange={handleTemperatureChange}
                onClear={() => handleTemperatureChange('')}
              />
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
          colorCancel="primary"
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
