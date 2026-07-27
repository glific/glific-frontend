describe('Role - Staff - Blocked Contact', () => {
  beforeEach(function () {
    cy.env(['staff']).then(({ staff }) => {
      cy.appLogin(staff.phone, staff.password);
      cy.visit('/blocked-contacts');
    });
  });

  it('should load blocked contacts list', () => {
    cy.get('[data-testid="listHeader"]').should('contain', 'Blocked contacts');
  });
});
