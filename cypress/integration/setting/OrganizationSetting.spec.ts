describe('Organization Settings', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/settings');
  });

  it('should navigate to settings list', () => {
    cy.get('h5').should('contain', 'Settings');
    cy.get('div').contains('Organization').find('[data-testid="EditIcon"]').click();
  });

  it('should update languages in organization settings', () => {
    cy.get('div').contains('Organization').find('[data-testid="EditIcon"]').click();
  });
});
