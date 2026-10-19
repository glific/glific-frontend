import type { GuardrailCheck, SandboxGuardrailTrace } from 'containers/AIEvaluation/types/sandboxType';
import { parseJson } from 'containers/AIEvaluation/utils/guardrails/guardrails';

const textOrNull = (value: unknown) => (typeof value === 'string' ? value : null);

const parseGuardrailChecks = (value: unknown): GuardrailCheck[] => {
  const list = parseJson(value);
  if (!Array.isArray(list)) return [];

  return list.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const { name, outcome, error } = entry as Record<string, unknown>;
    return typeof name === 'string' ? [{ name, outcome: textOrNull(outcome) ?? '', error: textOrNull(error) }] : [];
  });
};

export const toGuardrailTrace = (source: {
  inputFromUser?: unknown;
  inputToLlm?: unknown;
  outputFromLlm?: unknown;
  outputToUser?: unknown;
  inputChecks?: unknown;
  outputChecks?: unknown;
}): SandboxGuardrailTrace | null => {
  const trace = {
    inputFromUser: textOrNull(source.inputFromUser),
    inputToLlm: textOrNull(source.inputToLlm),
    outputFromLlm: textOrNull(source.outputFromLlm),
    outputToUser: textOrNull(source.outputToUser),
    inputChecks: parseGuardrailChecks(source.inputChecks),
    outputChecks: parseGuardrailChecks(source.outputChecks),
  };

  const isEmpty =
    trace.inputChecks.length === 0 &&
    trace.outputChecks.length === 0 &&
    [trace.inputFromUser, trace.inputToLlm, trace.outputFromLlm, trace.outputToUser].every((text) => text === null);
  return isEmpty ? null : trace;
};
