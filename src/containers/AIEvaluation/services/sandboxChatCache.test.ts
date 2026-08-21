import { setUserSession } from 'services/AuthService';
import { SANDBOX_CHAT_KEY_PREFIX } from '../utils/sandbox/sandbox';
import {
  clearAllSandboxChats,
  clearSandboxChat,
  clearSandboxChatsForAssistant,
  readSandboxChat,
  writeSandboxChat,
} from './sandboxChatCache';

const chat = { messages: [{ role: 'user' as const, text: 'Hello' }], conversationId: 'c1' };

beforeEach(() => {
  localStorage.clear();
  setUserSession(JSON.stringify({ organization: { id: '1' } }));
});

test('round-trips a transcript for one assistant version', () => {
  writeSandboxChat('a1', 'v1', chat);

  expect(readSandboxChat('a1', 'v1')).toEqual(chat);
});

test('keeps versions and assistants apart', () => {
  writeSandboxChat('a1', 'v1', chat);

  expect(readSandboxChat('a1', 'v2')).toBeNull();
  expect(readSandboxChat('a2', 'v1')).toBeNull();
});

test('another organisation cannot read the transcript', () => {
  writeSandboxChat('a1', 'v1', chat);

  setUserSession(JSON.stringify({ organization: { id: '2' } }));

  expect(readSandboxChat('a1', 'v1')).toBeNull();
});

test('does nothing without an assistant, a version or a session', () => {
  writeSandboxChat(undefined, 'v1', chat);
  writeSandboxChat('a1', undefined, chat);
  expect(readSandboxChat(undefined, undefined)).toBeNull();

  localStorage.removeItem('glific_user');
  writeSandboxChat('a1', 'v1', chat);
  expect(readSandboxChat('a1', 'v1')).toBeNull();
});

test('an empty transcript removes the entry rather than storing nothing', () => {
  writeSandboxChat('a1', 'v1', chat);

  writeSandboxChat('a1', 'v1', { messages: [], conversationId: 'c1' });

  expect(readSandboxChat('a1', 'v1')).toBeNull();
  expect(Object.keys(localStorage).filter((key) => key.startsWith(SANDBOX_CHAT_KEY_PREFIX))).toHaveLength(0);
});

test('keeps only the most recent messages', () => {
  const many = Array.from({ length: 60 }, (_, index) => ({ role: 'user' as const, text: `m${index}` }));

  writeSandboxChat('a1', 'v1', { messages: many, conversationId: 'c1' });

  const stored = readSandboxChat('a1', 'v1');
  expect(stored?.messages).toHaveLength(50);
  expect(stored?.messages[0].text).toBe('m10');
});

test('a corrupt entry reads as no chat at all', () => {
  writeSandboxChat('a1', 'v1', chat);
  const key = Object.keys(localStorage).find((entry) => entry.startsWith(SANDBOX_CHAT_KEY_PREFIX)) as string;

  localStorage.setItem(key, 'not json');
  expect(readSandboxChat('a1', 'v1')).toBeNull();

  localStorage.setItem(key, JSON.stringify({ conversationId: 'c1' }));
  expect(readSandboxChat('a1', 'v1')).toBeNull();
});

test('messages that could not be rendered are dropped', () => {
  writeSandboxChat('a1', 'v1', chat);
  const key = Object.keys(localStorage).find((entry) => entry.startsWith(SANDBOX_CHAT_KEY_PREFIX)) as string;

  localStorage.setItem(
    key,
    JSON.stringify({
      conversationId: 5,
      messages: [{ role: 'user', text: 'kept' }, { role: 'system', text: 'wrong role' }, { role: 'user' }, null],
    })
  );

  expect(readSandboxChat('a1', 'v1')).toEqual({ messages: [{ role: 'user', text: 'kept' }], conversationId: '' });
});

test('clearing one version leaves the others alone', () => {
  writeSandboxChat('a1', 'v1', chat);
  writeSandboxChat('a1', 'v2', chat);

  clearSandboxChat('a1', 'v1');

  expect(readSandboxChat('a1', 'v1')).toBeNull();
  expect(readSandboxChat('a1', 'v2')).toEqual(chat);
});

test('deleting an assistant takes every version with it', () => {
  writeSandboxChat('a1', 'v1', chat);
  writeSandboxChat('a1', 'v2', chat);
  writeSandboxChat('a2', 'v1', chat);

  clearSandboxChatsForAssistant('a1');

  expect(readSandboxChat('a1', 'v1')).toBeNull();
  expect(readSandboxChat('a1', 'v2')).toBeNull();
  expect(readSandboxChat('a2', 'v1')).toEqual(chat);
});

test('deleting an assistant without a session does nothing', () => {
  writeSandboxChat('a1', 'v1', chat);
  localStorage.removeItem('glific_user');

  clearSandboxChatsForAssistant('a1');

  setUserSession(JSON.stringify({ organization: { id: '1' } }));
  expect(readSandboxChat('a1', 'v1')).toEqual(chat);
});

test('logout clears every transcript but nothing else', () => {
  writeSandboxChat('a1', 'v1', chat);
  writeSandboxChat('a2', 'v9', chat);

  clearAllSandboxChats();

  expect(readSandboxChat('a1', 'v1')).toBeNull();
  expect(readSandboxChat('a2', 'v9')).toBeNull();
  // the session itself is cleared elsewhere, so it must survive this
  expect(localStorage.getItem('glific_user')).not.toBeNull();
});

describe('when storage is unavailable', () => {
  const unavailable = () => {
    throw new Error('QuotaExceededError');
  };

  test('listing keys degrades quietly when storage cannot be enumerated', () => {
    writeSandboxChat('a1', 'v1', chat);
    const keys = vi.spyOn(Object, 'keys').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => clearAllSandboxChats()).not.toThrow();
    expect(() => clearSandboxChatsForAssistant('a1')).not.toThrow();

    keys.mockRestore();
  });

  test('reads, writes and clears degrade quietly', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(unavailable);
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(unavailable);
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(unavailable);

    expect(() => writeSandboxChat('a1', 'v1', chat)).not.toThrow();
    expect(readSandboxChat('a1', 'v1')).toBeNull();
    expect(() => clearSandboxChat('a1', 'v1')).not.toThrow();
    expect(() => clearAllSandboxChats()).not.toThrow();

    setItem.mockRestore();
    getItem.mockRestore();
    removeItem.mockRestore();
  });
});
