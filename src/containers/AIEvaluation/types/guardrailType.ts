export type GuardrailValidatorType =
  | 'pii_remover'
  | 'profanity_free'
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
  label: string;
  options: GuardrailDetailOption[];
}

export interface GuardrailTopic {
  id: string;
  label: string;
  description: string;
}

export interface GuardrailTopicSuggestion {
  id: string;
  label: string;
  description: string;
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
  title: string;
  description: string;
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

export interface TopicsEditorValue {
  disallowedTopics: GuardrailTopic[];
  suggestedTopics: GuardrailTopicSuggestion[];
  setReply: string;
}

export interface TopicsEditorProps {
  value: TopicsEditorValue;
  onChange: (value: TopicsEditorValue) => void;
}
