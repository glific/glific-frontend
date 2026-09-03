import { BELOW_STICKY_HEADER, SEARCH_FIELD, openAssistantList } from '../../utils/assistant-flow';

const openList = openAssistantList;

describe('AI Assistant list', () => {
  beforeEach(() => {
    openList();
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

  it('reports an empty search rather than an empty list', () => {
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

describe('AI Assistant list without assistants', () => {
  it('says so plainly when the organisation has none yet', function () {
    openList().then((count) => {
      if (count > 0) {
        this.skip();
      }

      cy.contains('There are no assistants right now').should('be.visible');
    });
  });
});

describe('AI Assistant list with assistants', () => {
  beforeEach(function () {
    // skip on what the page was actually served, so a spec never waits out a list that is empty
    openList().then((count) => {
      if (count === 0) {
        this.skip();
      }
    });

    cy.get('[data-testid="tableBody"] tr', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('reports the evaluation health of every assistant listed', () => {
    cy.get('[data-testid="tableBody"] tr').then(($rows) => {
      cy.get('[data-testid="evaluationHealth"]').should('have.length', $rows.length);
    });
  });

  it('narrows the list to what was searched for, and puts it back on reset', () => {
    cy.get('[data-testid="tableBody"] tr')
      .first()
      .find('td')
      .first()
      .invoke('text')
      .then((cellText) => {
        const name = cellText.trim().split('asst_')[0].trim();

        cy.get(SEARCH_FIELD).type(name, BELOW_STICKY_HEADER);
        cy.get('[data-testid="tableBody"]', { timeout: 10000 }).should('contain', name);

        cy.get('[data-testid="resetButton"]').click(BELOW_STICKY_HEADER);
        cy.get('[data-testid="tableBody"] tr', { timeout: 10000 }).should(
          'have.length.greaterThan',
          0
        );
      });
  });

  it('opens an assistant from the list', () => {
    cy.get('[data-testid="edit-icon"]').first().click(BELOW_STICKY_HEADER);

    cy.location('pathname').should('match', /^\/assistants\/\d+$/);
    cy.get('[data-testid="assistantDetailContainer"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="versionBar"]').should('be.visible');
  });

  it('asks before deleting an assistant, and lets that be called off', () => {
    cy.get('[data-testid="tableBody"] tr')
      .first()
      .find('td')
      .first()
      .invoke('text')
      .then((cellText) => {
        const name = cellText.trim().split('asst_')[0].trim();

        cy.get('[data-testid="DeleteIcon"]').first().click(BELOW_STICKY_HEADER);
        cy.get('[data-testid="dialogTitle"]').should(
          'contain',
          'Are you sure you want to delete the assistant'
        );

        cy.get('[data-testid="cancel-button"]').click();
        // nothing was removed
        cy.get('[data-testid="tableBody"]').should('contain', name);
      });
  });
});
