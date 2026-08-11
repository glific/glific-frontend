import { getUserSession } from 'services/AuthService';
import type { SandboxChat, SandboxMessage } from 'containers/AIEvaluation/types/sandboxType';

export const SANDBOX_CHAT_KEY_PREFIX = 'glific_sandbox_chat';

const MAX_CACHED_MESSAGES = 50;

const keyFor = (organizationId: string, assistantId: string, versionId: string) =>
  `${SANDBOX_CHAT_KEY_PREFIX}:${organizationId}:${assistantId}:${versionId}`;

/**
 * Transcripts are scoped to org + assistant + version: a different version is a different
 * config, so its conversation is a different conversation.
 */
const resolveKey = (assistantId?: string, versionId?: string) => {
  const organizationId = currentOrganizationId();
  if (!organizationId || !assistantId || !versionId) return null;
  return keyFor(organizationId, assistantId, versionId);
};

/** the session itself lives in localStorage, so reading it can throw when storage is off */
const currentOrganizationId = () => {
  try {
    const organizationId = getUserSession('organizationId');
    return organizationId == null ? null : String(organizationId);
  } catch {
    return null;
  }
};

const removeKey = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // the entry is unreachable either way
  }
};

const sandboxKeys = () => {
  try {
    return Object.keys(localStorage).filter((key) => key.startsWith(`${SANDBOX_CHAT_KEY_PREFIX}:`));
  } catch {
    // storage can be unavailable entirely (Safari private mode, blocked cookies)
    return [];
  }
};

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
    // corrupt or unreadable entries behave like an empty chat rather than breaking the tab
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
  } catch {
    // a full or unavailable store just means the chat is not restored later
  }
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

/** everything, for logout — transcripts belong to the user who typed them */
export const clearAllSandboxChats = () => {
  sandboxKeys().forEach(removeKey);
};
