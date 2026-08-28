import type { AssistantVersion } from 'containers/AIEvaluation/types/assistantType';

export const compareVersionsDesc = (a: AssistantVersion, b: AssistantVersion) =>
  b.majorVersion - a.majorVersion || b.minorVersion - a.minorVersion;

export const isNewerThan = (version: AssistantVersion, previous: AssistantVersion | null) =>
  !previous || compareVersionsDesc(version, previous) < 0;
