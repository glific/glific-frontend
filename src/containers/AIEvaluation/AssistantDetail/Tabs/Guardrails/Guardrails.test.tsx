import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { setOrganizationServices } from 'services/AuthService';
import {
  ALL_GUARDRAIL_VALIDATORS,
  getGuardrailValidatorsErrorMock,
  getGuardrailValidatorsMock,
  guardrailDocsLink,
} from 'mocks/Guardrails';
import { Guardrails, GuardrailsPanel } from './Guardrails';
import type { GuardrailRule, GuardrailSpecs } from 'containers/AIEvaluation/types/guardrailType';
import { EMPTY_GUARDRAIL_SPECS } from 'containers/AIEvaluation/utils/guardrails/guardrails';

/*
 * The global mock returns keys verbatim, which would leave "{{count}}" in the assertions below.
 * This one fills interpolation in so the tests read the sentence a user actually sees.
 */
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? key.replace(/{{(\w+)}}/g, (token, name) => (name in options ? String(options[name]) : token)) : key,
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
}));

const renderGuardrails = (
  mocks: MockedResponse[] = [getGuardrailValidatorsMock()],
  props: Partial<Parameters<typeof Guardrails>[0]> = {}
) => {
  setOrganizationServices(JSON.stringify({ aiGuardrailEnabled: true }));
  return render(
    <MockedProvider mocks={mocks}>
      <Guardrails value={EMPTY_GUARDRAIL_SPECS} onChange={vi.fn()} {...props} />
    </MockedProvider>
  );
};

// renders with every validator the backend knows about, and waits until they have loaded
const renderPanel = async (props: Partial<Parameters<typeof Guardrails>[0]> = {}) => {
  const result = renderGuardrails(undefined, props);
  await screen.findByTestId('guardrailStage-incoming');
  return result;
};

// every rule starts off, and a rule's editor only shows once it is on
const turnOn = (ruleId: string) => fireEvent.click(screen.getByTestId(`guardrailToggle-${ruleId}`));

test('says Guardrails is coming soon when the org has not been rolled out', () => {
  setOrganizationServices(JSON.stringify({ aiGuardrailEnabled: false }));
  render(<Guardrails value={EMPTY_GUARDRAIL_SPECS} onChange={vi.fn()} />);

  expect(screen.getByTestId('guardrails')).toHaveTextContent('Guardrails coming soon');
});

describe('a rolled-out org', () => {
  test('sees both stages, each with its own running numbers', async () => {
    await renderPanel();

    const incoming = screen.getByTestId('guardrailStage-incoming');
    expect(incoming).toHaveTextContent('Guardrails on incoming messages');
    expect(within(incoming).getByTestId('guardrailRule-privacy-protection')).toHaveTextContent('1');
    expect(within(incoming).getByTestId('guardrailRule-content-safety')).toHaveTextContent('2');
    expect(within(incoming).getByTestId('guardrailRule-scope-control')).toHaveTextContent('3');

    // numbering starts over for the reply stage, rather than continuing from the one before it
    const reply = screen.getByTestId('guardrailStage-reply');
    expect(reply).toHaveTextContent('Guardrails on assistant replies');
    expect(within(reply).getByTestId('guardrailRule-gender-neutrality')).toHaveTextContent('1');
  });

  test('every rule starts off, with no editor showing', async () => {
    await renderPanel();

    expect(screen.getByTestId('guardrailToggle-privacy-protection')).not.toBeChecked();
    expect(screen.getByTestId('guardrailToggle-content-safety')).not.toBeChecked();
    expect(screen.getByTestId('guardrailToggle-scope-control')).not.toBeChecked();
    expect(screen.getByTestId('guardrailToggle-gender-neutrality')).not.toBeChecked();
    expect(screen.queryByTestId('editDetailTypesToggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('editTopicsToggle')).not.toBeInTheDocument();
  });

  test('turning a rule on shows its editor', async () => {
    await renderPanel();

    turnOn('scope-control');

    expect(screen.getByTestId('guardrailToggle-scope-control')).toBeChecked();
    expect(screen.getByTestId('editTopicsToggle')).toBeInTheDocument();
  });

  test('turning a rule off hides the editor it had open', async () => {
    await renderPanel();
    turnOn('scope-control');

    fireEvent.click(screen.getByTestId('editTopicsToggle'));
    expect(screen.getByTestId('topicsEditorBody')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('guardrailToggle-scope-control'));

    expect(screen.queryByTestId('topicsEditorBody')).not.toBeInTheDocument();
  });

  describe('the detail types a Privacy Protection check looks for', () => {
    test('starts collapsed, with what the backend turns on by default', async () => {
      await renderPanel();
      turnOn('privacy-protection');

      expect(screen.queryByTestId('detailTypesEditorBody')).not.toBeInTheDocument();
      // 15 kinds in the schema, 12 of them in its default
      expect(screen.getByTestId('editDetailTypesToggle')).toHaveTextContent('12 selected');
    });

    test('every kind in the schema is an option, grouped and named, ticked as its default says', async () => {
      await renderPanel();
      turnOn('privacy-protection');
      fireEvent.click(screen.getByTestId('editDetailTypesToggle'));

      expect(screen.getAllByTestId(/^detailOption-/)).toHaveLength(15);
      // one list, no headings — the ticked kinds first
      expect(screen.queryByText(/General details|Indian government IDs/)).not.toBeInTheDocument();
      const options = screen.getAllByTestId(/^detailOption-/);
      expect(options.slice(0, 12).every((option) => option.getAttribute('aria-pressed') === 'true')).toBe(true);
      expect(options.slice(12).every((option) => option.getAttribute('aria-pressed') === 'false')).toBe(true);

      expect(screen.getByTestId('detailOption-PHONE_NUMBER')).toHaveTextContent('Phone number');
      expect(screen.getByTestId('detailOption-PHONE_NUMBER')).toHaveAttribute('aria-pressed', 'true');
      // left out of the default, so left unticked
      expect(screen.getByTestId('detailOption-PERSON')).toHaveTextContent('Name');
      expect(screen.getByTestId('detailOption-PERSON')).toHaveAttribute('aria-pressed', 'false');
    });

    test('unselecting one updates the count', async () => {
      await renderPanel();
      turnOn('privacy-protection');
      fireEvent.click(screen.getByTestId('editDetailTypesToggle'));

      fireEvent.click(screen.getByTestId('detailOption-PHONE_NUMBER'));

      expect(screen.getByTestId('editDetailTypesToggle')).toHaveTextContent('11 selected');
      expect(screen.getByTestId('detailOption-PHONE_NUMBER')).toHaveAttribute('aria-pressed', 'false');
    });

    test('with no options in its config, Privacy Protection has nothing to edit', async () => {
      renderGuardrails([getGuardrailValidatorsMock([{ type: 'pii_remover', link: null }])]);
      await screen.findByTestId('guardrailRule-privacy-protection');
      turnOn('privacy-protection');

      expect(screen.queryByTestId('editDetailTypesToggle')).not.toBeInTheDocument();
    });

    test('each group has its own Clear and Select all', async () => {
      await renderPanel();
      turnOn('privacy-protection');
      fireEvent.click(screen.getByTestId('editDetailTypesToggle'));

      // the model-guessed group sits apart, under a note on how reliable it is
      expect(
        screen.getByText('Redacted using English model: misses many Indian names and sometimes masks ordinary words')
      ).toBeInTheDocument();
      const [clearMatched] = screen.getAllByText('Clear', { selector: 'button' });
      const [, selectAllGuessed] = screen.getAllByText('Select all', { selector: 'button' });

      fireEvent.click(clearMatched);
      expect(screen.getByTestId('editDetailTypesToggle')).toHaveTextContent('0 selected');
      expect(screen.getAllByText('Nothing in this group is checked.')).toHaveLength(2);

      fireEvent.click(selectAllGuessed);
      expect(screen.getByTestId('editDetailTypesToggle')).toHaveTextContent('3 selected');
      expect(screen.getByTestId('detailOption-PERSON')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('detailOption-PHONE_NUMBER')).toHaveAttribute('aria-pressed', 'false');
    });

    test('the toggles read "Configure …" for every check that has one', async () => {
      await renderPanel();
      turnOn('privacy-protection');
      turnOn('scope-control');

      expect(screen.getByTestId('editDetailTypesToggle')).toHaveTextContent('Configure');
      expect(screen.getByTestId('editTopicsToggle')).toHaveTextContent('Configure');
    });

    test('Content Safety and Gender Neutrality have nothing to configure', async () => {
      await renderPanel();
      turnOn('content-safety');
      turnOn('gender-neutrality');

      for (const ruleId of ['content-safety', 'gender-neutrality']) {
        expect(
          within(screen.getByTestId(`guardrailRule-${ruleId}`)).queryByRole('button', { name: /Configure/ })
        ).toBeNull();
      }
    });
  });

  describe('whether a check fixes or blocks comes from its on_fail', () => {
    test('every check the backend sends today defaults to "fix", so each says it fixes', async () => {
      await renderPanel();

      for (const ruleId of ['privacy-protection', 'content-safety', 'scope-control', 'gender-neutrality']) {
        expect(screen.getByTestId(`guardrailRule-${ruleId}`)).toHaveTextContent('Fixes & passes on');
      }
    });

    test('an "exception" default makes it block', async () => {
      renderGuardrails([
        getGuardrailValidatorsMock([
          { type: 'topic_relevance_llm', link: null, config: { properties: { on_fail: { default: 'exception' } } } },
        ]),
      ]);

      expect(await screen.findByTestId('guardrailRule-scope-control')).toHaveTextContent('Blocks — sends set reply');
    });
  });

  test('Scope Control starts its set reply from the fallback message in its config', async () => {
    renderGuardrails([
      getGuardrailValidatorsMock([
        {
          type: 'topic_relevance_llm',
          link: null,
          config: {
            properties: { fallback_message: { default: 'Main sirf sehat ke sawalon mein madad karti hoon.' } },
          },
        },
      ]),
    ]);
    await screen.findByTestId('guardrailRule-scope-control');
    turnOn('scope-control');
    fireEvent.click(screen.getByTestId('editTopicsToggle'));

    expect(screen.getByTestId('setReplyInput')).toHaveValue('Main sirf sehat ke sawalon mein madad karti hoon.');
  });

  describe('the topics a Scope Control check blocks', () => {
    const openEditor = async () => {
      await renderPanel();
      turnOn('scope-control');
      fireEvent.click(screen.getByTestId('editTopicsToggle'));
    };

    const addSuggestion = (suggestionId: string) =>
      fireEvent.click(screen.getByTestId(`suggestedTopic-${suggestionId}`));

    // a topic added from a suggestion takes the suggestion's id, prefixed
    const addedFrom = (suggestionId: string) => `disallowedTopic-topic-${suggestionId}`;

    test('starts with nothing blocked, nothing suggested picked and no reply written', async () => {
      await openEditor();

      expect(screen.getByTestId('editTopicsToggle')).toHaveTextContent('0 added');
      expect(screen.queryByTestId(/^disallowedTopic-/)).not.toBeInTheDocument();
      screen.getAllByTestId(/^suggestedTopic-/).forEach((suggestion) => expect(suggestion).toBeEnabled());
      expect(screen.getByTestId('setReplyInput')).toHaveValue('');
    });

    test('a suggestion can be added with one click, and then shows as added', async () => {
      await openEditor();

      addSuggestion('suggest-politics-religion');

      expect(screen.getByTestId('editTopicsToggle')).toHaveTextContent('1 added');
      expect(screen.getByTestId(addedFrom('suggest-politics-religion'))).toHaveTextContent('elections');
      expect(screen.getByTestId('suggestedTopic-suggest-politics-religion')).toBeDisabled();
    });

    test('a suggestion already on the list does nothing more when clicked', async () => {
      await openEditor();
      addSuggestion('suggest-politics-religion');

      addSuggestion('suggest-politics-religion');

      expect(screen.getByTestId('editTopicsToggle')).toHaveTextContent('1 added');
    });

    test('removing a topic takes it off the list, and its suggestion can be picked again', async () => {
      await openEditor();
      addSuggestion('suggest-politics-religion');
      addSuggestion('suggest-medical-treatment-claims');

      fireEvent.click(within(screen.getByTestId(addedFrom('suggest-politics-religion'))).getByRole('button'));

      expect(screen.queryByTestId(addedFrom('suggest-politics-religion'))).not.toBeInTheDocument();
      expect(screen.getByTestId('editTopicsToggle')).toHaveTextContent('1 added');
      expect(screen.getByTestId('suggestedTopic-suggest-politics-religion')).toBeEnabled();
    });

    test('removing every topic leaves just the input to add one', async () => {
      await openEditor();
      addSuggestion('suggest-politics-religion');

      fireEvent.click(within(screen.getByTestId(addedFrom('suggest-politics-religion'))).getByRole('button'));

      expect(screen.queryByTestId(/^disallowedTopic-/)).not.toBeInTheDocument();
      expect(screen.getByTestId('newTopicInput')).toBeInTheDocument();
      expect(screen.getByTestId('editTopicsToggle')).toHaveTextContent('0 added');
    });

    test('typing a topic and pressing Enter adds it', async () => {
      await openEditor();

      fireEvent.change(screen.getByTestId('newTopicInput'), { target: { value: 'Self-harm' } });
      fireEvent.keyDown(screen.getByTestId('newTopicInput'), { key: 'Enter' });

      expect(screen.getByText('Self-harm', { exact: false })).toBeInTheDocument();
      expect(screen.getByTestId('editTopicsToggle')).toHaveTextContent('1 added');
      expect(screen.getByTestId('newTopicInput')).toHaveValue('');
    });

    test('clicking + Add works the same as pressing Enter', async () => {
      await openEditor();

      fireEvent.change(screen.getByTestId('newTopicInput'), { target: { value: 'Violence' } });
      fireEvent.click(screen.getByTestId('addTopicButton'));

      expect(screen.getByText('Violence', { exact: false })).toBeInTheDocument();
      expect(screen.getByTestId('editTopicsToggle')).toHaveTextContent('1 added');
    });

    test('an empty draft adds nothing, whether by Enter or by the button', async () => {
      await openEditor();

      // + Add stays faded until something is typed, as in the design
      expect(screen.getByTestId('addTopicButton')).toBeDisabled();

      fireEvent.keyDown(screen.getByTestId('newTopicInput'), { key: 'Enter' });
      fireEvent.click(screen.getByTestId('addTopicButton'));

      expect(screen.getByTestId('editTopicsToggle')).toHaveTextContent('0 added');
    });

    test('typing a topic that is already blocked does not add a second one', async () => {
      await openEditor();
      addSuggestion('suggest-politics-religion');

      fireEvent.change(screen.getByTestId('newTopicInput'), { target: { value: 'politics & religion' } });
      fireEvent.click(screen.getByTestId('addTopicButton'));

      expect(screen.getByTestId('editTopicsToggle')).toHaveTextContent('1 added');
    });

    test('the reply sent when the guardrail fires can be written', async () => {
      await openEditor();

      fireEvent.change(screen.getByTestId('setReplyInput'), { target: { value: 'Naya jawab.' } });

      expect(screen.getByTestId('setReplyInput')).toHaveValue('Naya jawab.');
    });
  });

  describe('the "when a guardrail is triggered" banner', () => {
    test('starts closed, showing just the title and the legend', async () => {
      await renderPanel();

      expect(screen.getByTestId('guardrailsLegend')).toHaveTextContent('Fixes & passes on');
      expect(screen.getByTestId('guardrailsSeeHowButton')).toHaveTextContent('See how');
      expect(screen.queryByTestId('guardrailsHowItWorks')).not.toBeInTheDocument();
    });

    test('See how opens both flows, and Hide closes them again', async () => {
      await renderPanel();

      fireEvent.click(screen.getByTestId('guardrailsSeeHowButton'));

      expect(screen.getByTestId('guardrailsSeeHowButton')).toHaveTextContent('Hide');
      expect(screen.getByTestId('guardrailsFlow-fix')).toHaveTextContent('Flagged part hidden / reworded');
      expect(screen.getByTestId('guardrailsFlow-block')).toHaveTextContent('Your set reply is sent to the user');
      // the legend stays put either way
      expect(screen.getByTestId('guardrailsLegend')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('guardrailsSeeHowButton'));

      expect(screen.queryByTestId('guardrailsHowItWorks')).not.toBeInTheDocument();
      expect(screen.getByTestId('guardrailsSeeHowButton')).toHaveTextContent('See how');
    });

    test('the caret on the left opens and closes it too', async () => {
      await renderPanel();
      const caret = screen.getByTestId('guardrailsBannerToggle');

      fireEvent.click(caret);
      expect(caret).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByTestId('guardrailsHowItWorks')).toBeInTheDocument();

      fireEvent.click(caret);
      expect(caret).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByTestId('guardrailsHowItWorks')).not.toBeInTheDocument();
    });
  });

  describe('what the backend returns decides what is shown', () => {
    test('each card Info link opens that validator docs in a new tab', async () => {
      await renderPanel();

      ['privacy-protection', 'content-safety', 'scope-control', 'gender-neutrality'].forEach((ruleId) => {
        const info = screen.getByTestId(`guardrailInfo-${ruleId}`);
        expect(info).toHaveAttribute('href', guardrailDocsLink(ruleId));
        expect(info).toHaveAttribute('target', '_blank');
        expect(info).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    test('hovering Info shows the rule description in a tooltip', async () => {
      await renderPanel();

      fireEvent.mouseOver(screen.getByTestId('guardrailInfo-content-safety'));

      // the description shows twice — on the card, and now in the tooltip
      await waitFor(() =>
        expect(screen.getAllByText('Removes abusive or hurtful words from messages.')).toHaveLength(2)
      );
    });

    test('cards follow the tab order, not the order the backend sends them in', async () => {
      await renderPanel();

      const incoming = screen.getByTestId('guardrailStage-incoming');
      const ids = within(incoming)
        .getAllByTestId(/^guardrailRule-/)
        .map((card) => card.getAttribute('data-testid'));
      expect(ids).toEqual([
        'guardrailRule-privacy-protection',
        'guardrailRule-content-safety',
        'guardrailRule-scope-control',
      ]);
    });

    test('a validator the backend does not return gets no card', async () => {
      renderGuardrails([
        getGuardrailValidatorsMock(ALL_GUARDRAIL_VALIDATORS.filter((v) => v.type !== 'gender_assumption_bias')),
      ]);
      await screen.findByTestId('guardrailStage-incoming');

      expect(screen.queryByTestId('guardrailRule-gender-neutrality')).not.toBeInTheDocument();
      // with nothing left in it, the replies stage goes too
      expect(screen.queryByTestId('guardrailStage-reply')).not.toBeInTheDocument();
    });

    test('a validator type the tab does not know is skipped', async () => {
      renderGuardrails([
        getGuardrailValidatorsMock([...ALL_GUARDRAIL_VALIDATORS, { type: 'jailbreak_detector', link: null }]),
      ]);
      await screen.findByTestId('guardrailStage-incoming');

      expect(screen.getAllByTestId(/^guardrailRule-/)).toHaveLength(4);
    });

    test('a validator without a link keeps its Info tooltip, but Info opens nothing', async () => {
      renderGuardrails([getGuardrailValidatorsMock([{ type: 'uli_slur_match', link: null }])]);
      await screen.findByTestId('guardrailRule-content-safety');

      const info = screen.getByTestId('guardrailInfo-content-safety');
      expect(info).not.toHaveAttribute('href');

      fireEvent.mouseOver(info);
      await waitFor(() =>
        expect(screen.getAllByText('Removes abusive or hurtful words from messages.')).toHaveLength(2)
      );
    });

    test('says so when the validators cannot be loaded', async () => {
      renderGuardrails([getGuardrailValidatorsErrorMock]);

      expect(await screen.findByText('Guardrails could not be loaded. Please try again.')).toBeInTheDocument();
    });
  });

  describe('a stage or tier with nothing in it', () => {
    const onlyIncomingRule: GuardrailRule = {
      id: 'solo-rule',
      type: 'uli_slur_match',
      link: null,
      stage: 'incoming',
      tier: 'additional',
      title: 'Solo Rule',
      description: 'The only rule in this mock.',
      action: 'fix',
      enabled: true,
      control: { kind: 'none' },
    };

    test('a stage nothing is assigned to is left out entirely', () => {
      render(<GuardrailsPanel initialRules={[onlyIncomingRule]} value={EMPTY_GUARDRAIL_SPECS} onChange={vi.fn()} />);

      expect(screen.getByTestId('guardrailStage-incoming')).toBeInTheDocument();
      expect(screen.queryByTestId('guardrailStage-reply')).not.toBeInTheDocument();
    });

    test('a tier nothing is assigned to is left out of the stage it would have joined', () => {
      render(<GuardrailsPanel initialRules={[onlyIncomingRule]} value={EMPTY_GUARDRAIL_SPECS} onChange={vi.fn()} />);

      // "Solo Rule" is tier "additional" — "Recommended" has nothing under it and does not render
      expect(screen.queryByText('Recommended')).not.toBeInTheDocument();
      expect(screen.getByText('Additional')).toBeInTheDocument();
      expect(screen.getByText('Solo Rule')).toBeInTheDocument();
    });
  });
});

describe('saving and loading', () => {
  const saved: GuardrailSpecs = {
    input: [
      { type: 'pii_remover', entity_types: ['PHONE_NUMBER', 'IN_AADHAAR'] },
      {
        type: 'topic_relevance_llm',
        on_fail: 'rephrase',
        configuration: 'Politics & Religion — elections\nCricket scores',
        fallback_message: 'I can only help with farming questions.',
      },
    ],
    output: [{ type: 'gender_assumption_bias' }],
  };

  test('turning a rule on reports its spec on the list for its stage', async () => {
    const onChange = vi.fn();
    await renderPanel({ onChange });

    turnOn('privacy-protection');
    turnOn('gender-neutrality');

    const latest = onChange.mock.calls.at(-1)?.[0] as GuardrailSpecs;
    expect(latest.input).toEqual([{ type: 'pii_remover', entity_types: expect.arrayContaining(['PHONE_NUMBER']) }]);
    expect(latest.output).toEqual([{ type: 'gender_assumption_bias' }]);
  });

  test('saved specs switch their rules on and fill in what was picked', async () => {
    await renderPanel({ value: saved });

    expect(screen.getByTestId('guardrailToggle-privacy-protection')).toBeChecked();
    expect(screen.getByTestId('guardrailToggle-content-safety')).not.toBeChecked();
    expect(screen.getByTestId('guardrailToggle-gender-neutrality')).toBeChecked();
    expect(screen.getByTestId('editDetailTypesToggle')).toHaveTextContent('2 selected');

    fireEvent.click(screen.getByTestId('editTopicsToggle'));
    // a saved topic matching a suggestion shows that suggestion as already added
    expect(screen.getByTestId('disallowedTopic-topic-suggest-politics-religion')).toHaveTextContent(
      'Politics & Religion — elections'
    );
    expect(screen.getByText('Cricket scores')).toBeInTheDocument();
    expect(screen.getByTestId('setReplyInput')).toHaveValue('I can only help with farming questions.');
  });

  test('editing keeps the params the tab does not show, and specs for checks it does not know', async () => {
    const onChange = vi.fn();
    await renderPanel({
      value: { ...saved, input: [...saved.input, { type: 'future_check', level: 2 }] },
      onChange,
    });

    fireEvent.click(screen.getByTestId('editTopicsToggle'));
    fireEvent.change(screen.getByTestId('setReplyInput'), { target: { value: 'Ask me about crops.' } });

    const latest = onChange.mock.calls.at(-1)?.[0] as GuardrailSpecs;
    expect(latest.input).toContainEqual({
      type: 'topic_relevance_llm',
      on_fail: 'rephrase',
      configuration: 'Politics & Religion — elections\nCricket scores',
      fallback_message: 'Ask me about crops.',
    });
    expect(latest.input).toContainEqual({ type: 'future_check', level: 2 });
  });

  test('turning a rule off drops its spec', async () => {
    const onChange = vi.fn();
    await renderPanel({ value: saved, onChange });

    fireEvent.click(screen.getByTestId('guardrailToggle-gender-neutrality'));

    expect((onChange.mock.calls.at(-1)?.[0] as GuardrailSpecs).output).toEqual([]);
  });

  test('new specs from the page (another version, or a discard) reload the rules', async () => {
    const { rerender } = await renderPanel({ value: saved });
    expect(screen.getByTestId('guardrailToggle-privacy-protection')).toBeChecked();

    rerender(
      <MockedProvider mocks={[getGuardrailValidatorsMock()]}>
        <Guardrails value={EMPTY_GUARDRAIL_SPECS} onChange={vi.fn()} />
      </MockedProvider>
    );

    await waitFor(() => expect(screen.getByTestId('guardrailToggle-privacy-protection')).not.toBeChecked());
  });
});
