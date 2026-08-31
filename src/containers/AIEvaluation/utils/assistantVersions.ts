import type { AssistantVersion } from 'containers/AIEvaluation/types/assistantType';

export const compareVersionsDesc = (a: AssistantVersion, b: AssistantVersion) =>
  b.majorVersion - a.majorVersion || b.minorVersion - a.minorVersion;

export const isNewerThan = (version: AssistantVersion, previous: AssistantVersion | null) =>
  !previous || compareVersionsDesc(version, previous) < 0;

/**
 * Publishing promotes the version to the next major. The exception is an assistant that has never
 * gone live: its first version goes live as it stands rather than jumping a number.
 */
export const nextPublishLabel = (versions: AssistantVersion[], selected: AssistantVersion, hasLiveVersion: boolean) => {
  if (!hasLiveVersion && selected.minorVersion === 0) return selected.versionLabel;

  const highestMajor = versions.reduce((highest, version) => Math.max(highest, version.majorVersion), 0);
  return `${highestMajor + 1}.0`;
};
