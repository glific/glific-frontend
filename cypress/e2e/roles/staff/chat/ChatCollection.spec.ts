describe('Role - Staff - ChatCollection', () => {
  beforeEach(function () {
    cy.env(['staff']).then(({ staff }) => {
      cy.appLogin(staff.phone, staff.password);
    });
    cy.addContactToCollection();
    cy.visit('/chat/collection');
    cy.get('[data-testid="searchInput"]').click().wait(500).type('Default Group').wait(1000);
    cy.get('[data-testid="name"]').click().wait(500);
  });

  it('should send the message to collection', () => {
    cy.sendTextMessage('collection');
  });
});
