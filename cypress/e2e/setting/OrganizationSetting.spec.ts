describe('Organization Settings', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/settings');
  });

  it('should navigate to settings list', () => {
    cy.wait(2000);
    cy.get('[data-testid="heading"]').should('contain', 'Settings');
  });

  it('should update language in organization settings', () => {
    cy.get('[data-testid="setting-drawer"]').contains('Organization').click();
    cy.wait(2000);
    cy.get('[data-testid="autocomplete-element"]').first().click({ force: true }).type('Kan');
    cy.contains('Kannada').click();

    cy.get('[data-testid="submitActionButton"]').click({ force: true });
    cy.get('div').should('contain', 'Settings edited successfully!');
  });

  it('should have valid available data', () => {
    cy.get('[data-testid="setting-drawer"]').contains('Organization').click();
    cy.wait(500);

    cy.get('[data-testid="autocomplete-element"]').first().click({ force: true });

    cy.get('[data-testid="autocomplete-element"]').eq(1).click({ force: true });
  });
});
