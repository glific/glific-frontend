describe('Organization Settings', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/settings');
  });

  it('should navigate to settings list', () => {
    cy.get('h5').should('contain', 'Settings');
  });

  it('should update languages in organization settings', () => {
    cy.get('[data-testid="organization"]').find('[data-testid="EditIcon"]').click();
    cy.get('[data-testid="AutocompleteInput"]').first().click().type('Hind');
    cy.contains('Hindi').click();
    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'Settings edited successfully!');
  });
});
