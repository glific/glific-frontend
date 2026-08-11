export interface SandboxMessage {
  role: 'user' | 'assistant';
  text: string;
  failed?: boolean;
  timedOut?: boolean;
}

export interface SandboxChat {
  messages: SandboxMessage[];
  conversationId: string;
}

export interface AssistantChatResponse {
  answer?: string | null;
  conversationId?: string | null;
  requestId?: string | null;
  errors?: { key?: string; message: string }[] | null;
}

export interface UseAssistantChatResponseOptions {
  enabled: boolean;
  onResponse: (result: AssistantChatResponse) => void;
}
