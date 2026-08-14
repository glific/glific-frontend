import { getUserSession } from 'services/AuthService';

export const SANDBOX_CHAT_KEY_PREFIX = 'glific_sandbox_chat';

export const normalizeLineBreaks = (text: string) => {
  if (text.includes('\n') || !text.includes('\\n')) return text;
  return text.replace(/\\r\\n|\\n/g, '\n');
};

export const currentOrganizationId = () => {
  try {
    const organizationId = getUserSession('organizationId');
    return organizationId == null ? null : String(organizationId);
  } catch {
    return null;
  }
};

export const removeKey = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {}
};

export const sandboxKeys = () => {
  try {
    return Object.keys(localStorage).filter((key) => key.startsWith(`${SANDBOX_CHAT_KEY_PREFIX}:`));
  } catch {
    return [];
  }
};

export const resolveKey = (assistantId?: string, versionId?: string) => {
  const organizationId = currentOrganizationId();
  if (!organizationId || !assistantId || !versionId) return null;
  return `${SANDBOX_CHAT_KEY_PREFIX}:${organizationId}:${assistantId}:${versionId}`;
};
