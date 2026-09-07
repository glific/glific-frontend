import type { AssistantVersion } from 'containers/AIEvaluation/types/assistantType';

export const compareVersionsDesc = (a: AssistantVersion, b: AssistantVersion) =>
  b.majorVersion - a.majorVersion || b.minorVersion - a.minorVersion;

export const isNewerThan = (version: AssistantVersion, previous: AssistantVersion | null) =>
  !previous || compareVersionsDesc(version, previous) < 0;

export const nextPublishLabel = (versions: AssistantVersion[], selected: AssistantVersion, hasLiveVersion: boolean) => {
  if (!hasLiveVersion && selected.minorVersion === 0) return selected.versionLabel;

  const highestMajor = versions.reduce((highest, version) => Math.max(highest, version.majorVersion), 0);
  return `${highestMajor + 1}.0`;
};

export const mergeVersionUpdate = (current: AssistantVersion, updated: Partial<AssistantVersion>): AssistantVersion => {
  const carried = Object.fromEntries(
    Object.entries(updated).filter(([, value]) => value !== null && value !== undefined)
  );
  const merged = { ...current, ...carried } as AssistantVersion;

  return { ...merged, versionLabel: merged.versionLabel || `${merged.majorVersion}.${merged.minorVersion}` };
};
