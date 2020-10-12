describe('Profile', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/user-profile');
  });

  it('should load profile page and save successfully', () => {
    cy.get('h5').should('contain', 'My Profile');
    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'Contact edited successfully!');
  });
});
