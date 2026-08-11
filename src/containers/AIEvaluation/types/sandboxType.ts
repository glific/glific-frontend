export interface SandboxMessage {
  role: 'user' | 'assistant';
  text: string;
  failed?: boolean;
}

export interface SandboxChat {
  messages: SandboxMessage[];
  conversationId: string;
}

export interface LlmCallResponse {
  answer?: string | null;
  conversationId?: string | null;
  requestId?: string | null;
  errors?: { key?: string; message: string }[] | null;
}
