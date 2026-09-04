import {
  BELOW_STICKY_HEADER,
  SEARCH_FIELD,
  V2_SERVICES,
  loginWithServices,
  openAssistantList,
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
      const needle = String(term).toLowerCase();
      const matching = term
        ? available.filter((entry) =>
            [entry.name, entry.assistantDisplayId].some((value) =>
              String(value).toLowerCase().includes(needle)
            )
          )
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

const openStubbedList = (available = ASSISTANTS) => {
  loginWithServices(V2_SERVICES);
  stubAssistants(available);
  cy.visit('/assistants');
};

// what the page is made of, checked against whatever the real backend serves
describe('AI Assistant list', () => {
  beforeEach(() => {
    openAssistantList();
  });

  it('shows the page header, the search field and the create button', () => {
    cy.get('[data-testid="headingButton"]').should('contain', 'Create New Assistant');
    cy.get('[data-testid="searchInput"]').should('be.visible');
  });

  it('lays out the columns the new flow adds', () => {
    cy.get('[data-testid="tableHead"]').within(() => {
      cy.contains('Assistant Name').should('be.visible');
      cy.contains('Evaluation Health').should('be.visible');
      cy.contains('Live Version').should('be.visible');
      cy.contains('Actions').should('be.visible');
    });
  });

  it('explains the health scale on hover rather than in the header', () => {
    cy.get('[data-testid="evaluationHealthInfo"]')
      .first()
      .trigger('mouseover', BELOW_STICKY_HEADER);

    cy.get('[role="tooltip"]').should('contain', 'Scored 0–5 by our automated judge');
  });

  it('asks the server for the term that was typed, and reports an empty search', () => {
    cy.get(SEARCH_FIELD).type('a-name-no-assistant-will-have', BELOW_STICKY_HEADER);

    // the field takes the text, and the list then asks the server for that term
    cy.get(SEARCH_FIELD).should('have.value', 'a-name-no-assistant-will-have');
    cy.wait('@assistantsQuery', { timeout: 15000 })
      .its('request.body.variables.filter.name_or_assistant_id')
      .should('eq', 'a-name-no-assistant-will-have');

    cy.contains('Sorry, no results found! Please try a different search.', {
      timeout: 10000,
    }).should('be.visible');

    cy.get('[data-testid="resetButton"]').click(BELOW_STICKY_HEADER);
    cy.contains('Sorry, no results found! Please try a different search.').should('not.exist');
  });
});

// what a row says and does, on a list served from a fixed set so the assertions can be exact
describe('AI Assistant list rows', () => {
  beforeEach(() => {
    openStubbedList();
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

  it('finds an assistant by its id as well as its name', () => {
    cy.get(SEARCH_FIELD).type('asst_10000000000', BELOW_STICKY_HEADER);

    cy.get('[data-testid="tableBody"] tr', { timeout: 10000 }).should('have.length', 1);
    cy.get('[data-testid="tableBody"]').should('contain', 'Maternal Health Bot');
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
    openStubbedList([]);

    cy.contains('There are no assistants right now', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="tableBody"] tr').should('not.exist');
    cy.get('[data-testid="headingButton"]').should('contain', 'Create New Assistant');
  });
});
