describe('Staff Management', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/staff-management');
  });

  it('should load staff management list', () => {
    cy.get('h5').should('contain', 'Staff Management');
  });
});
