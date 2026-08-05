describe('WhatsApp Polls', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/group/polls');
  });

  it('creates a new poll', () => {
    cy.get('[data-testid="newItemButton"]').click();

    cy.get('input[name=label]').click().type('WhatsApp Poll');
    cy.get('textarea[name=content]').click().type('Which is the best day of the week?');
    cy.get('input[placeholder="Option 1"]').click().type('Sunday');
    cy.get('input[placeholder="Option 2"]').click().type('Monday');

    cy.get('[data-testid="add-btn"]').click();

    cy.get('input[placeholder="Option 3"]').click().type('Sunday');

    cy.get('div').should('contain', 'Values must be unique');

    cy.get('[data-testid="add-btn"]').click();

    cy.get('input[placeholder="Option 4"]').click().type('Friday');

    cy.get('[data-testid="cross-icon"]').first().click();

    cy.get('[data-testid="checkboxLabel"]').click();
    cy.get('[data-testid="submitActionButton"]').click();

    cy.get('div').should('contain', 'Poll created successfully!');
  });

  it('it views the content of the poll', () => {
    cy.get('[data-testid="view-icon"]').first().click();
    cy.get('div').should('contain', 'Which is the best day of the week?');
  });

  it('duplicates the poll', () => {
    cy.get('[data-testid="duplicate-icon"]').first().click();
    cy.get('div').should('contain', 'Copy Poll');
    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'Copy of WhatsApp Poll');
  });

  it('it deletes the poll', () => {
    cy.get('[data-testid="delete-icon"]').first().click();
    cy.get('div').should('contain', 'Do you want to delete this poll?');
    cy.get('[data-testid="ok-button"]').click();
    cy.get('div').should('contain', 'Poll deleted successfully');
  });
});
