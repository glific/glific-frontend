export interface SandboxMessage {
  role: 'user' | 'assistant';
  text: string;
  failed?: boolean;
}

/** what survives a refresh: the transcript and the thread it belongs to */
export interface SandboxChat {
  messages: SandboxMessage[];
  conversationId: string;
}

/** the llmCallResponse payload, shared by the mutation result and the subscription */
export interface LlmCallResponse {
  answer?: string | null;
  conversationId?: string | null;
  requestId?: string | null;
  errors?: { key?: string; message: string }[] | null;
}
