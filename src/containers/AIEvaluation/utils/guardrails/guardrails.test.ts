import { PII_REMOVER_CONFIG, TOPIC_RELEVANCE_LLM_CONFIG } from 'mocks/Guardrails';
import type { GuardrailTopicSuggestion } from 'containers/AIEvaluation/types/guardrailType';
import {
  actionFromConfig,
  isTranslationKey,
  parseGuardrailSpecs,
  piiDetailGroups,
  safeLink,
  scopeFallbackMessage,
  topicsFromConfiguration,
  topicsToConfiguration,
} from './guardrails';

describe('piiDetailGroups', () => {
  test('splits pattern-matched kinds from model-guessed ones, ticked as the default says', () => {
    const groups = piiDetailGroups(PII_REMOVER_CONFIG);

    expect(groups.map((group) => group.id)).toEqual(['pattern-matched', 'model-guessed']);
    const [matched, guessed] = groups;

    expect(matched.note).toBeUndefined();
    expect(matched.options).toHaveLength(12);
    expect(matched.options.every((option) => option.selected)).toBe(true);

    // the model-guessed kinds carry a note on how reliable they are, and none is in the default
    expect(guessed.note).toBe(
      'Redacted using English model: misses many Indian names and sometimes masks ordinary words'
    );
    expect(guessed.options.map((option) => [option.id, option.selected])).toEqual([
      ['LOCATION', false],
      ['NRP', false],
      ['PERSON', false],
    ]);
    expect(piiDetailGroups(JSON.stringify(PII_REMOVER_CONFIG))).toEqual(groups);
  });

  test('ticked ones come first within a group, and an empty group is left out', () => {
    const groups = piiDetailGroups({
      properties: { entity_types: { items: { enum: ['LOCATION', 'PERSON'] }, default: ['PERSON'] } },
    });

    expect(groups.map((group) => group.id)).toEqual(['model-guessed']);
    expect(groups[0].options.map((option) => option.id)).toEqual(['PERSON', 'LOCATION']);
  });

  test('a kind it has no name for reads as words', () => {
    const [group] = piiDetailGroups({
      properties: { entity_types: { items: { enum: ['CRYPTO_WALLET'] } } },
    });

    expect(group.options).toEqual([{ id: 'CRYPTO_WALLET', label: 'Crypto Wallet', selected: true }]);
  });

  test('with no default, every kind starts ticked', () => {
    const groups = piiDetailGroups({
      ...PII_REMOVER_CONFIG,
      properties: { entity_types: { items: { $ref: '#/$defs/PIIEntityType' }, default: null } },
    });

    expect(groups.flatMap((group) => group.options).every((option) => option.selected)).toBe(true);
  });

  test('anything without an entity list gives no groups', () => {
    for (const config of [undefined, null, '', 'not json', 42, {}, { properties: {} }, { title: 'stub' }]) {
      expect(piiDetailGroups(config)).toEqual([]);
    }
  });
});

describe('actionFromConfig', () => {
  test('"exception" and "rephrase" block; "fix", anything unknown or no on_fail at all fixes', () => {
    const withOnFail = (value: unknown) => ({
      properties: { on_fail: { $ref: '#/$defs/GuardrailOnFail', default: value } },
    });

    expect(actionFromConfig(withOnFail('exception'))).toBe('block');
    expect(actionFromConfig(JSON.stringify(withOnFail('exception')))).toBe('block');
    expect(actionFromConfig(withOnFail('fix'))).toBe('fix');
    expect(actionFromConfig(withOnFail('rephrase'))).toBe('block');
    expect(actionFromConfig(withOnFail('reask'))).toBe('fix');
    expect(actionFromConfig({})).toBe('fix');
    expect(actionFromConfig('not json')).toBe('fix');
  });
});

describe('scopeFallbackMessage', () => {
  test('is the default fallback message, or empty without one', () => {
    expect(scopeFallbackMessage(TOPIC_RELEVANCE_LLM_CONFIG)).toBe('');
    expect(scopeFallbackMessage({ properties: { fallback_message: { default: 'Sirf sehat.' } } })).toBe('Sirf sehat.');
    expect(scopeFallbackMessage('not json')).toBe('');
  });
});

describe('parseGuardrailSpecs', () => {
  test('reads a JSON string or an already-parsed list, dropping entries without a type', () => {
    const specs = [{ type: 'pii_remover' }, { on_fail: 'fix' }, { type: '' }, 'nope'];

    expect(parseGuardrailSpecs(JSON.stringify(specs))).toEqual([{ type: 'pii_remover' }]);
    expect(parseGuardrailSpecs(specs)).toEqual([{ type: 'pii_remover' }]);
  });

  test('anything that is not a list gives no specs', () => {
    expect(parseGuardrailSpecs(null)).toEqual([]);
    expect(parseGuardrailSpecs('not json')).toEqual([]);
    expect(parseGuardrailSpecs({ type: 'pii_remover' })).toEqual([]);
  });
});

describe('topics configuration', () => {
  const suggestions: GuardrailTopicSuggestion[] = [
    {
      id: 'suggest-politics',
      label: 'Legal & financial advice',
      description: 'legal proceedings, investment advice, loans, tax filing',
    },
  ];

  test('round-trips topics, one per line, keeping commas inside a description', () => {
    const topics = [
      { id: 'topic-suggest-politics', label: 'Legal & financial advice', description: 'loans, tax filing' },
      { id: 'custom-cricket-1', label: 'Cricket', description: '' },
    ];

    const configuration = topicsToConfiguration(topics);
    expect(configuration).toBe('Legal & financial advice — loans, tax filing\nCricket');
    expect(topicsFromConfiguration(configuration, suggestions)).toEqual([
      { id: 'topic-suggest-politics', label: 'Legal & financial advice', description: 'loans, tax filing' },
      { id: 'custom-cricket-1', label: 'Cricket', description: '' },
    ]);
  });

  test('a configuration that is not text gives no topics', () => {
    expect(topicsFromConfiguration(undefined, suggestions)).toEqual([]);
  });
});

describe('safeLink', () => {
  test('keeps web addresses and drops every other kind of link', () => {
    expect(safeLink('https://projecttech4devai.github.io/kaapi-docs/guardrails/pii')).toBe(
      'https://projecttech4devai.github.io/kaapi-docs/guardrails/pii'
    );
    expect(safeLink('javascript:alert(1)')).toBeNull();
    expect(safeLink('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(safeLink('not a url')).toBeNull();
    expect(safeLink(null)).toBeNull();
  });
});

describe('isTranslationKey', () => {
  test('a label the app has a translation for is one; a code we only made readable is not', () => {
    expect(isTranslationKey('Aadhaar number')).toBe(true);
    expect(isTranslationKey('Crypto Wallet')).toBe(false);
    expect(isTranslationKey('toString')).toBe(false);
  });
});
