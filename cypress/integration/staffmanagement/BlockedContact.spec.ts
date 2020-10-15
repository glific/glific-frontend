describe('Blocked Contact', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/blocked-contacts');
  });

  it('should load blocked contacts list', () => {
    cy.get('h5').should('contain', 'Blocked contacts');
  });
});
