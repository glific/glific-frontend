import { PII_REMOVER_CONFIG, TOPIC_RELEVANCE_LLM_CONFIG } from 'mocks/Guardrails';
import { actionFromConfig, isTranslationKey, piiDetailGroups, scopeFallbackMessage } from './guardrails';

describe('piiDetailGroups', () => {
  test('reads every kind into one list, ticked as the default says, ticked ones first', () => {
    const groups = piiDetailGroups(PII_REMOVER_CONFIG);

    expect(groups).toHaveLength(1);
    const [{ options }] = groups;
    expect(options).toHaveLength(15);
    expect(options.filter((option) => option.selected)).toHaveLength(12);

    expect(options.slice(0, 12).every((option) => option.selected)).toBe(true);
    expect(options.slice(12).map((option) => option.id)).toEqual(['LOCATION', 'NRP', 'PERSON']);
    expect(piiDetailGroups(JSON.stringify(PII_REMOVER_CONFIG))).toEqual(groups);
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

describe('isTranslationKey', () => {
  test('a label the app has a translation for is one; a code we only made readable is not', () => {
    expect(isTranslationKey('Aadhaar number')).toBe(true);
    expect(isTranslationKey('Crypto Wallet')).toBe(false);
    expect(isTranslationKey('toString')).toBe(false);
  });
});
