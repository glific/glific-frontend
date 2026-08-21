import type { SandboxChat, SandboxMessage } from 'containers/AIEvaluation/types/sandboxType';
import {
  SANDBOX_CHAT_KEY_PREFIX,
  currentOrganizationId,
  removeKey,
  resolveKey,
  sandboxKeys,
} from '../utils/sandbox/sandbox';

const MAX_CACHED_MESSAGES = 50;

export const readSandboxChat = (assistantId?: string, versionId?: string): SandboxChat | null => {
  const key = resolveKey(assistantId, versionId);
  if (!key) return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<SandboxChat>;
    if (!parsed || !Array.isArray(parsed.messages)) return null;

    // drop anything that is not a message we could render
    const messages = parsed.messages.filter(
      (message): message is SandboxMessage =>
        Boolean(message) &&
        typeof message.text === 'string' &&
        (message.role === 'user' || message.role === 'assistant')
    );

    return { messages, conversationId: typeof parsed.conversationId === 'string' ? parsed.conversationId : '' };
  } catch {
    return null;
  }
};

export const writeSandboxChat = (assistantId: string | undefined, versionId: string | undefined, chat: SandboxChat) => {
  const key = resolveKey(assistantId, versionId);
  if (!key) return;

  // nothing to remember once the transcript is empty
  if (chat.messages.length === 0) {
    clearSandboxChat(assistantId, versionId);
    return;
  }

  try {
    localStorage.setItem(
      key,
      JSON.stringify({ messages: chat.messages.slice(-MAX_CACHED_MESSAGES), conversationId: chat.conversationId })
    );
  } catch {}
};

export const clearSandboxChat = (assistantId?: string, versionId?: string) => {
  const key = resolveKey(assistantId, versionId);
  if (key) removeKey(key);
};

/** every version of one assistant, for when the assistant itself is deleted */
export const clearSandboxChatsForAssistant = (assistantId: string) => {
  const organizationId = currentOrganizationId();
  if (!organizationId) return;

  const prefix = `${SANDBOX_CHAT_KEY_PREFIX}:${organizationId}:${assistantId}:`;
  sandboxKeys()
    .filter((key) => key.startsWith(prefix))
    .forEach(removeKey);
};

export const clearAllSandboxChats = () => {
  sandboxKeys().forEach(removeKey);
};
