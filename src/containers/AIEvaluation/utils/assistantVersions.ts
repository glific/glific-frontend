import type { AssistantVersion } from 'containers/AIEvaluation/types/assistantType';

/**
 * Versions are ordered by major then minor, so 2.0 sorts above 1.9. Comparing the label as a
 * string would put "1.10" below "1.9", which is why the two numbers are compared separately.
 */
export const compareVersionsDesc = (a: AssistantVersion, b: AssistantVersion) =>
  b.majorVersion - a.majorVersion || b.minorVersion - a.minorVersion;

/** is `version` newer than the one that was newest before a save? */
export const isNewerThan = (version: AssistantVersion, previous: AssistantVersion | null) =>
  !previous || compareVersionsDesc(version, previous) < 0;
