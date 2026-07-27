describe('Blocked Contact', () => {
  beforeEach(function () {
    cy.login();
    cy.visit('/blocked-contacts');
  });

  it('should load blocked contacts list', () => {
    cy.get('[data-testid="listHeader"]').should('contain', 'Blocked contacts');
  });
});
