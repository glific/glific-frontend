import type { ReactNode } from 'react';
import type { resources } from 'i18n/config';

export type TranslationKey = keyof (typeof resources)['en']['translation'];

export type GuardrailValidatorType =
  | 'pii_remover'
  | 'uli_slur_match'
  | 'topic_relevance_llm'
  | 'gender_assumption_bias';

export interface GuardrailValidator {
  type: string;
  link: string | null;
  config: string;
}

export type GuardrailAction = 'fix' | 'block';

export type GuardrailStage = 'incoming' | 'reply';

export type GuardrailTier = 'recommended' | 'additional';

export interface GuardrailDetailOption {
  id: string;
  label: string;
  selected: boolean;
}

export interface GuardrailDetailGroup {
  id: string;
  note?: TranslationKey;
  options: GuardrailDetailOption[];
}

export interface GuardrailTopic {
  id: string;
  label: string;
  description: string;
}

export interface GuardrailTopicSuggestion {
  id: string;
  label: TranslationKey;
  description: TranslationKey;
}

export type GuardrailControl =
  | { kind: 'none' }
  | { kind: 'detailTypes'; groups: GuardrailDetailGroup[] }
  | {
      kind: 'topics';
      disallowedTopics: GuardrailTopic[];
      suggestedTopics: GuardrailTopicSuggestion[];
      setReply: string;
    };

export interface GuardrailRule {
  id: string;
  type: GuardrailValidatorType;
  link: string | null;
  stage: GuardrailStage;
  tier: GuardrailTier;
  title: TranslationKey;
  description: TranslationKey;
  action: GuardrailAction;
  enabled: boolean;
  control: GuardrailControl;
}

export interface GuardrailValidatorsData {
  guardrailValidators: { validators: GuardrailValidator[] | null } | null;
}

export type GuardrailFlowStepIcon = 'message' | 'guard' | 'assistant' | 'reply';

export interface GuardrailFlowStep {
  icon: GuardrailFlowStepIcon;
  label: string;
  tone: 'neutral' | 'action' | 'skipped';
  reachedBy: 'none' | 'arrow' | 'stopped';
}

export interface GuardrailSpec {
  type: string;
  [param: string]: unknown;
}

export interface GuardrailSpecs {
  input: GuardrailSpec[];
  output: GuardrailSpec[];
}

export interface GuardrailsProps {
  value: GuardrailSpecs;
  onChange: (value: GuardrailSpecs) => void;
  invalidTypes?: string[];
}

export interface GuardrailsPanelProps extends GuardrailsProps {
  initialRules: GuardrailRule[];
}

export interface GuardrailRuleCardProps {
  id: string;
  number: number;
  title: string;
  description: string;
  link: string | null;
  action: GuardrailAction;
  enabled: boolean;
  invalid?: boolean;
  onToggle: (enabled: boolean) => void;
  children?: ReactNode;
}

export interface GuardrailEditorProps {
  summary: string;
  toggleTestId: string;
  bodyTestId: string;
  children: ReactNode;
}

export interface DetailTypesEditorProps {
  groups: GuardrailDetailGroup[];
  onChange: (groups: GuardrailDetailGroup[]) => void;
}

export interface TopicsEditorValue {
  disallowedTopics: GuardrailTopic[];
  suggestedTopics: GuardrailTopicSuggestion[];
  setReply: string;
}

export interface TopicsEditorProps {
  value: TopicsEditorValue;
  onChange: (value: TopicsEditorValue) => void;
}
