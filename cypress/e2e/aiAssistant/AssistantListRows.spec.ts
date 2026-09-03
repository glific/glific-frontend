import {
  BELOW_STICKY_HEADER,
  SEARCH_FIELD,
  V2_SERVICES,
  loginWithServices,
} from '../../utils/assistant-flow';

const assistant = (id: string, name: string, overrides: Record<string, unknown> = {}) => ({
  __typename: 'Assistant',
  id,
  assistantDisplayId: `asst_${id}0000000000`,
  name,
  status: 'ready',
  liveVersionLabel: '1.0',
  activeConfigVersionId: `v${id}`,
  cloneStatus: null,
  insertedAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  lastEvaluationSummary: null,
  ...overrides,
});

const ASSISTANTS = [
  assistant('1', 'Maternal Health Bot', {
    lastEvaluationSummary: JSON.stringify({
      overall_score: 4.32,
      ai_summary: 'Answers hold up well.',
    }),
  }),
  assistant('2', 'ANC Follow-ups', {
    lastEvaluationSummary: JSON.stringify({
      overall_score: 2.66,
      ai_summary: 'Drifts on longer questions.',
    }),
  }),
  assistant('3', 'Nutrition Helper'),
];

const stubAssistants = (available = ASSISTANTS) => {
  cy.intercept('POST', Cypress.expose('backendUrl'), (req) => {
    if (req.body?.operationName === 'Assistants') {
      const term = req.body.variables?.filter?.name_or_assistant_id ?? '';
      const matching = term
        ? available.filter((entry) => entry.name.toLowerCase().includes(String(term).toLowerCase()))
        : available;

      req.reply({ body: { data: { assistants: matching } } });
      return;
    }

    if (req.body?.operationName === 'CountAssistants') {
      req.reply({ body: { data: { countAssistants: available.length } } });
      return;
    }

    req.continue();
  }).as('assistantsQuery');
};

describe('AI Assistant list with assistants', () => {
  beforeEach(() => {
    loginWithServices(V2_SERVICES);
    stubAssistants();

    cy.visit('/assistants');
    cy.get('[data-testid="tableBody"] tr', { timeout: 10000 }).should(
      'have.length',
      ASSISTANTS.length
    );
  });

  it('lists every assistant with its id under the name', () => {
    cy.get('[data-testid="tableBody"]').should('contain', 'Maternal Health Bot');
    cy.get('[data-testid="tableBody"]').should('contain', 'asst_10000000000');
    cy.get('[data-testid="tableBody"]').should('contain', 'Version 1.0');
  });

  it('reports the evaluation health of each one, and says so when there is none', () => {
    cy.get('[data-testid="evaluationHealth"]').should('have.length', ASSISTANTS.length);

    // 4.32 reads as good, 2.66 as could improve, and the one never evaluated says exactly that
    cy.get('[data-testid="evaluationHealth"]').eq(0).should('contain', 'Good 4.32');
    cy.get('[data-testid="evaluationHealth"]').eq(1).should('contain', 'Could improve 2.66');
    cy.get('[data-testid="evaluationHealth"]').eq(2).should('contain', 'Not evaluated');
  });

  it('narrows the list to what was searched for, and puts it back on reset', () => {
    cy.get(SEARCH_FIELD).type('Nutrition', BELOW_STICKY_HEADER);

    cy.get('[data-testid="tableBody"] tr', { timeout: 10000 }).should('have.length', 1);
    cy.get('[data-testid="tableBody"]').should('contain', 'Nutrition Helper');

    cy.get('[data-testid="resetButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="tableBody"] tr', { timeout: 10000 }).should(
      'have.length',
      ASSISTANTS.length
    );
  });

  it('says so plainly when a search matches nothing', () => {
    cy.get(SEARCH_FIELD).type('no-such-assistant', BELOW_STICKY_HEADER);

    cy.contains('Sorry, no results found! Please try a different search.', {
      timeout: 10000,
    }).should('be.visible');
  });

  it('opens the assistant behind the row', () => {
    cy.get('[data-testid="edit-icon"]').first().click(BELOW_STICKY_HEADER);

    cy.location('pathname').should('eq', '/assistants/1');
  });

  it('asks before deleting an assistant, and lets that be called off', () => {
    cy.get('[data-testid="DeleteIcon"]').first().click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="dialogTitle"]').should(
      'contain',
      'Are you sure you want to delete the assistant'
    );
    cy.get('[data-testid="dialogTitle"]').should('contain', 'Maternal Health Bot');

    cy.get('[data-testid="cancel-button"]').click();
    cy.get('[data-testid="tableBody"] tr').should('have.length', ASSISTANTS.length);
  });

  it('offers to copy an assistant', () => {
    cy.get('[data-testid="copy-icon"]').first().click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="dialogTitle"]').should('contain', 'Clone Assistant');
    cy.get('[data-testid="cancel-button"]').click();
  });
});

describe('AI Assistant list with nothing in it', () => {
  it('says so plainly, and still offers to create the first one', () => {
    loginWithServices(V2_SERVICES);
    stubAssistants([]);

    cy.visit('/assistants');

    cy.contains('There are no assistants right now', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="tableBody"] tr').should('not.exist');
    cy.get('[data-testid="headingButton"]').should('contain', 'Create New Assistant');
  });
});
