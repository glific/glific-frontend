import { BELOW_STICKY_HEADER } from '../../utils/assistant-flow';
import { ASSISTANT_ID } from '../../utils/assistant-fixtures';
import {
  CONTENT_SAFETY_REPLY,
  GUARDED_VERSIONS,
  GUARDRAIL_SERVICES,
  PII_DEFAULT_ENTITY_TYPES,
  POLITICS_TOPIC,
  SCOPE_CONTROL_REPLY,
} from '../../utils/guardrail-fixtures';
import { openAssistant, openTab, type StubOptions } from '../../utils/assistant-detail';

const openGuardrails = (options: StubOptions = {}) => {
  openAssistant({ services: GUARDRAIL_SERVICES, ...options });
  openTab('guardrails');
  cy.get('[data-testid="guardrailStage-incoming"]', { timeout: 10000 }).should('be.visible');
};

const rule = (id: string) => cy.get(`[data-testid="guardrailRule-${id}"]`);
const toggle = (id: string) =>
  cy.get(`[data-testid="guardrailToggle-${id}"]`).click(BELOW_STICKY_HEADER);
const saveVersion = () => cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

// the guardrails travel to the server as JSON strings on the version that is saved
const savedGuardrails = () =>
  cy.wait('@UpdateAssistant').then((interception) => {
    const variables = interception.request.body.variables;
    expect(variables?.updateAssistantId).to.eq(ASSISTANT_ID);
    return {
      input: JSON.parse(variables?.input?.inputGuardrails ?? '[]'),
      output: JSON.parse(variables?.input?.outputGuardrails ?? '[]'),
    };
  });

describe('the Guardrails tab for an organisation without guardrails', () => {
  it('says guardrails are coming, and shows no rules', () => {
    openAssistant();
    openTab('guardrails');

    cy.get('[data-testid="guardrails"]').should('contain', 'Guardrails coming soon');
    cy.get('[data-testid="guardrailRule-content-safety"]').should('not.exist');
  });
});

describe('the Guardrails tab', () => {
  beforeEach(() => {
    openGuardrails();
  });

  it('lists the guardrails by when they run, all off to start with', () => {
    cy.get('[data-testid="guardrailStage-incoming"]')
      .should('contain', 'Guardrails on incoming messages')
      .within(() => {
        cy.get('[data-testid="guardrailRule-privacy-protection"]').should(
          'contain',
          'Privacy Protection'
        );
        cy.get('[data-testid="guardrailRule-content-safety"]').should('contain', 'Content Safety');
        cy.get('[data-testid="guardrailRule-scope-control"]').should('contain', 'Scope Control');
      });

    cy.get('[data-testid="guardrailStage-reply"]')
      .should('contain', 'Guardrails on assistant replies')
      .find('[data-testid="guardrailRule-gender-neutrality"]')
      .should('contain', 'Gender Neutrality');

    ['privacy-protection', 'content-safety', 'scope-control', 'gender-neutrality'].forEach((id) => {
      cy.get(`[data-testid="guardrailToggle-${id}"]`).should('not.be.checked');
    });
    cy.get('[data-testid="tabDirtyDot-guardrails"]').should('not.exist');
  });

  it('says what each guardrail does when it is triggered', () => {
    rule('content-safety').should('contain', 'Blocks — sends set reply');
    rule('privacy-protection').should('contain', 'Fixes & passes on');
  });

  it('links each guardrail to its documentation', () => {
    cy.get('[data-testid="guardrailInfo-content-safety"]')
      .should(
        'have.attr',
        'href',
        'https://projecttech4devai.github.io/kaapi-docs/guardrails/content-safety'
      )
      .and('have.attr', 'target', '_blank');
  });

  it('explains how fixing and blocking differ, and folds the explanation away again', () => {
    cy.get('[data-testid="guardrailsHowItWorks"]').should('not.exist');

    cy.get('[data-testid="guardrailsSeeHowButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="guardrailsFlow-fix"]').should('contain', 'AI assistant answers as usual');
    cy.get('[data-testid="guardrailsFlow-block"]').should(
      'contain',
      'Your set reply is sent to the user'
    );

    cy.get('[data-testid="guardrailsSeeHowButton"]')
      .should('contain', 'Hide')
      .click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="guardrailsHowItWorks"]').should('not.exist');
  });
});

describe('Content Safety', () => {
  beforeEach(() => {
    openGuardrails();
    toggle('content-safety');
  });

  it('asks for a reply once it is turned on, and marks the tab as edited', () => {
    cy.get('[data-testid="guardrailToggle-content-safety"]').should('be.checked');
    cy.get('[data-testid="tabDirtyDot-guardrails"]').should('be.visible');
    cy.get('[data-testid="editReplyToggle"]').should('contain', 'No reply set');
  });

  it('will not save with no reply set, and points at the guardrail to fix', () => {
    saveVersion();

    cy.contains(
      'Content Safety is on, but no reply is set. Add the reply to send in the Guardrails tab, or turn Content Safety off.'
    ).should('be.visible');
    rule('content-safety').should('have.attr', 'aria-invalid', 'true');
    cy.contains('Changes saved successfully').should('not.exist');
  });

  it('saves the set reply as the message to send instead of an abusive one', () => {
    cy.get('[data-testid="editReplyToggle"]').click(BELOW_STICKY_HEADER);
    rule('content-safety').find('[data-testid="setReplyInput"]').type(CONTENT_SAFETY_REPLY);
    cy.get('[data-testid="editReplyToggle"]').should('contain', 'Reply set');

    saveVersion();

    savedGuardrails().then(({ input, output }) => {
      expect(input).to.deep.equal([
        { type: 'content_safety', on_fail: 'rephrase', fallback_message: CONTENT_SAFETY_REPLY },
      ]);
      expect(output).to.deep.equal([]);
    });
    cy.contains('Changes saved successfully').should('be.visible');
    rule('content-safety').should('have.attr', 'aria-invalid', 'false');
  });
});

describe('Scope Control', () => {
  beforeEach(() => {
    openGuardrails();
    toggle('scope-control');
    cy.get('[data-testid="editTopicsToggle"]').click(BELOW_STICKY_HEADER);
  });

  it('adds a suggested topic, and will not add it twice', () => {
    cy.get('[data-testid="editTopicsToggle"]').should('contain', '0 added');

    cy.get('[data-testid="suggestedTopic-suggest-politics-religion"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="disallowedTopic-topic-suggest-politics-religion"]').should(
      'contain',
      POLITICS_TOPIC
    );
    cy.get('[data-testid="suggestedTopic-suggest-politics-religion"]').should('be.disabled');
    cy.get('[data-testid="editTopicsToggle"]').should('contain', '1 added');
  });

  it('adds a topic of its own on Enter, and takes it off again', () => {
    cy.get('[data-testid="addTopicButton"]').should('be.disabled');

    cy.get('[data-testid="newTopicInput"]').type('Vaccines{enter}');
    cy.get('[data-testid="disallowedTopic-custom-vaccines-0"]').should('contain', 'Vaccines');
    cy.get('[data-testid="newTopicInput"]').should('have.value', '');

    cy.get('[aria-label="Remove Vaccines"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="disallowedTopic-custom-vaccines-0"]').should('not.exist');
  });

  it('will not save with no topic to block', () => {
    saveVersion();

    cy.contains(
      'Scope Control is on, but no topics are added. Add at least one topic to block in the Guardrails tab, or turn Scope Control off.'
    ).should('be.visible');
    rule('scope-control').should('have.attr', 'aria-invalid', 'true');
  });

  it('saves the blocked topics, one per line, with the reply to send', () => {
    cy.get('[data-testid="suggestedTopic-suggest-politics-religion"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="newTopicInput"]').type('Vaccines');
    cy.get('[data-testid="addTopicButton"]').click(BELOW_STICKY_HEADER);
    rule('scope-control').find('[data-testid="setReplyInput"]').type(SCOPE_CONTROL_REPLY);

    saveVersion();

    savedGuardrails().then(({ input }) => {
      expect(input).to.deep.equal([
        {
          type: 'topic_relevance_llm',
          configuration: `${POLITICS_TOPIC}\nVaccines`,
          fallback_message: SCOPE_CONTROL_REPLY,
        },
      ]);
    });
    cy.contains('Changes saved successfully').should('be.visible');
  });
});

describe('Privacy Protection', () => {
  beforeEach(() => {
    openGuardrails();
    toggle('privacy-protection');
    cy.get('[data-testid="editDetailTypesToggle"]').click(BELOW_STICKY_HEADER);
  });

  it('starts from the recommended personal details, and saves the ones picked', () => {
    cy.get('[data-testid="editDetailTypesToggle"]').should(
      'contain',
      `${PII_DEFAULT_ENTITY_TYPES.length} selected`
    );
    cy.get('[data-testid="detailOption-PERSON"]').should('have.attr', 'aria-pressed', 'false');

    cy.get('[data-testid="detailOption-PERSON"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="detailOption-PERSON"]').should('have.attr', 'aria-pressed', 'true');

    saveVersion();

    savedGuardrails().then(({ input }) => {
      expect(input).to.have.length(1);
      expect(input[0].type).to.eq('pii_remover');
      expect(input[0].entity_types).to.have.members([...PII_DEFAULT_ENTITY_TYPES, 'PERSON']);
    });
  });

  it('will not save with every personal detail cleared', () => {
    cy.get('[data-testid="detailTypesEditorBody"] button:contains("Clear")').click({
      ...BELOW_STICKY_HEADER,
      multiple: true,
    });
    cy.get('[data-testid="editDetailTypesToggle"]').should('contain', '0 selected');
    cy.contains('Nothing in this group is checked.').should('be.visible');

    saveVersion();

    cy.contains(
      'Privacy Protection is on, but no personal details are selected. Select at least one in the Guardrails tab, or turn Privacy Protection off.'
    ).should('be.visible');
    rule('privacy-protection').should('have.attr', 'aria-invalid', 'true');
  });
});

describe('Gender Neutrality', () => {
  it('runs on the assistant’s replies once it is turned on', () => {
    openGuardrails();
    toggle('gender-neutrality');

    saveVersion();

    savedGuardrails().then(({ input, output }) => {
      expect(input).to.deep.equal([]);
      expect(output).to.deep.equal([{ type: 'gender_assumption_bias' }]);
    });
  });
});

describe('more than one guardrail left unfinished', () => {
  it('names them all in one warning', () => {
    openGuardrails();
    toggle('content-safety');
    toggle('scope-control');

    saveVersion();

    cy.contains(
      'Content Safety, Scope Control are on but not set up. Fix the ones marked in red in the Guardrails tab, or turn them off.'
    ).should('be.visible');
    rule('content-safety').should('have.attr', 'aria-invalid', 'true');
    rule('scope-control').should('have.attr', 'aria-invalid', 'true');
  });
});

describe('a version saved with guardrails on', () => {
  beforeEach(() => {
    openGuardrails({ versions: GUARDED_VERSIONS });
  });

  it('opens with the guardrails and settings that version was saved with', () => {
    cy.get('[data-testid="guardrailToggle-content-safety"]').should('be.checked');
    cy.get('[data-testid="guardrailToggle-scope-control"]').should('be.checked');
    cy.get('[data-testid="guardrailToggle-gender-neutrality"]').should('be.checked');
    cy.get('[data-testid="guardrailToggle-privacy-protection"]').should('not.be.checked');

    cy.get('[data-testid="editReplyToggle"]')
      .should('contain', 'Reply set')
      .click(BELOW_STICKY_HEADER);
    rule('content-safety')
      .find('[data-testid="setReplyInput"]')
      .should('have.value', CONTENT_SAFETY_REPLY);

    cy.get('[data-testid="editTopicsToggle"]')
      .should('contain', '1 added')
      .click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="disallowedTopic-topic-suggest-politics-religion"]').should('be.visible');

    cy.get('[data-testid="tabDirtyDot-guardrails"]').should('not.exist');
  });

  it('drops a guardrail that is turned off, and keeps the ones this tab does not show', () => {
    toggle('content-safety');

    saveVersion();

    savedGuardrails().then(({ input, output }) => {
      const types = input.map((spec: { type: string }) => spec.type);
      expect(types).to.not.include('content_safety');
      expect(types).to.include('topic_relevance_llm');
      expect(input).to.deep.include({ type: 'ban_list', banned_words: ['scam'] });
      expect(output).to.deep.equal([{ type: 'gender_assumption_bias' }]);
    });
  });

  it('puts the saved guardrails back when the edit is discarded', () => {
    toggle('content-safety');
    cy.get('[data-testid="tabDirtyDot-guardrails"]').should('be.visible');

    cy.get('[data-testid="discardButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="dialogTitle"]').should('contain', 'Discard unsaved changes?');
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="guardrailToggle-content-safety"]').should('be.checked');
    cy.get('[data-testid="tabDirtyDot-guardrails"]').should('not.exist');
  });
});

describe('when the guardrails cannot be loaded', () => {
  it('says so in place of the rules', () => {
    openAssistant({ services: GUARDRAIL_SERVICES, fails: ['guardrailValidators'] });
    openTab('guardrails');

    cy.get('[data-testid="guardrails"]', { timeout: 15000 }).should(
      'contain',
      'Guardrails could not be loaded. Please try again.'
    );
    cy.get('[data-testid="guardrailRule-content-safety"]').should('not.exist');
  });
});
