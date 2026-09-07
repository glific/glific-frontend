import { compareVersionsDesc, isNewerThan, mergeVersionUpdate, nextPublishLabel } from './assistantVersions';
import type { AssistantVersion } from 'containers/AIEvaluation/types/assistantType';

const version = (majorVersion: number, minorVersion: number): AssistantVersion => ({
  id: `v${majorVersion}.${minorVersion}`,
  majorVersion,
  minorVersion,
  versionLabel: `${majorVersion}.${minorVersion}`,
  model: 'gpt-4o',
  prompt: '',
  settings: {},
  status: 'ready',
  isLive: false,
  insertedAt: '2026-08-10T10:00:00Z',
  updatedAt: '2026-08-10T10:00:00Z',
});

describe('compareVersionsDesc', () => {
  test('orders by major first, then minor', () => {
    const sorted = [version(1, 9), version(2, 0), version(1, 10)].sort(compareVersionsDesc);

    // 1.10 above 1.9 — comparing the label as a string would put it below
    expect(sorted.map((entry) => entry.versionLabel)).toEqual(['2.0', '1.10', '1.9']);
  });
});

describe('isNewerThan', () => {
  test('anything is newer than nothing', () => {
    expect(isNewerThan(version(1, 0), null)).toBe(true);
  });

  test('a higher minor of the same major counts as newer', () => {
    expect(isNewerThan(version(1, 3), version(1, 2))).toBe(true);
    expect(isNewerThan(version(1, 2), version(1, 3))).toBe(false);
  });
});

describe('nextPublishLabel', () => {
  test('publishing lands above every version that exists', () => {
    const versions = [version(3, 3), version(2, 0), version(1, 0)];

    expect(nextPublishLabel(versions, version(3, 3), true)).toBe('4.0');
  });

  test('an assistant that has never gone live publishes its first version as it stands', () => {
    const versions = [version(1, 0)];

    expect(nextPublishLabel(versions, version(1, 0), false)).toBe('1.0');
  });

  test('a draft off a never published assistant still moves up a major', () => {
    const versions = [version(1, 0), version(1, 1)];

    // 1.1 carries unsaved-from-1.0 work, so it cannot go live under its own number
    expect(nextPublishLabel(versions, version(1, 1), false)).toBe('2.0');
  });
});

describe('mergeVersionUpdate', () => {
  test('takes what the update carries', () => {
    const merged = mergeVersionUpdate(version(2, 0), { status: 'ready', isLive: true });

    expect(merged.status).toBe('ready');
    expect(merged.isLive).toBe(true);
  });

  test('a field the server left null does not blank out what is on screen', () => {
    // versionLabel is derived when the server builds a list, so a pushed version arrives without it
    const merged = mergeVersionUpdate(version(3, 1), { status: 'ready', versionLabel: null as never });

    expect(merged.versionLabel).toBe('3.1');
    expect(merged.prompt).toBe(version(3, 1).prompt);
  });

  test('a label missing from both sides is rebuilt from the numbers', () => {
    const merged = mergeVersionUpdate({ ...version(4, 2), versionLabel: '' }, { status: 'ready' });

    expect(merged.versionLabel).toBe('4.2');
  });

  test('false is a value, not a gap', () => {
    const merged = mergeVersionUpdate({ ...version(1, 0), isLive: true }, { isLive: false });

    expect(merged.isLive).toBe(false);
  });
});
