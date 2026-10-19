export interface GuardrailCheck {
  name: string;
  outcome: string;
  error: string | null;
}

export interface SandboxGuardrailTrace {
  inputFromUser: string | null;
  inputToLlm: string | null;
  outputFromLlm: string | null;
  outputToUser: string | null;
  inputChecks: GuardrailCheck[];
  outputChecks: GuardrailCheck[];
}

export interface SandboxMessage {
  role: 'user' | 'assistant';
  text: string;
  failed?: boolean;
  timedOut?: boolean;
  guardrails?: SandboxGuardrailTrace;
}

export interface SandboxChat {
  messages: SandboxMessage[];
  conversationId: string;
}

export interface AssistantChatResponse {
  answer?: string | null;
  conversationId?: string | null;
  requestId?: string | null;
  inputFromUser?: string | null;
  inputToLlm?: string | null;
  outputFromLlm?: string | null;
  outputToUser?: string | null;
  inputGuardrail?: unknown;
  outputGuardrail?: unknown;
  errors?: { key?: string; message: string }[] | null;
}

export interface GuardrailTraceProps {
  trace: SandboxGuardrailTrace;
}

export interface GuardrailTraceStageProps {
  title: string;
  before: { label: string; text: string | null };
  after: { label: string; text: string | null };
  checks: GuardrailCheck[];
  testId: string;
}

export interface UseAssistantChatResponseOptions {
  enabled: boolean;
  onResponse: (result: AssistantChatResponse) => void;
}
