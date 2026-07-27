describe('Role - Staff - Chats', () => {
  beforeEach(function () {
    cy.env(['staff']).then(({ staff }) => {
      cy.appLogin(staff.phone, staff.password);
      cy.visit('/chat');
      cy.wait(1000);
      cy.get('[data-testid="searchInput"]')
        .click({ force: true })
        .wait(500)
        .type('Glific Simulator')
        .wait(1000);
      cy.get("div[data-testid='listingContainer'] > ul").find('a').first().click();
    });
  });

  it('should have only chat menu', () => {
    cy.get('[data-testid="list"]').first().should('contain', 'Chats');

    cy.get('[data-testid="list"]')
      .first()
      .and('not.contain', 'Speed sends')
      .and('not.contain', 'Flows')
      .and('not.contain', 'Searches')
      .and('not.contain', 'Templates');
  });

  it('should send the message correctly', () => {
    cy.sendTextMessage();
  });
});
