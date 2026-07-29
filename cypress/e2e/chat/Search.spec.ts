describe('Search', () => {
  beforeEach(function () {
    cy.login();
    cy.visit('/chat');
    cy.wait(500);
    cy.closeSimulator();
  });

  it('should check unread messages', () => {
    cy.get('[data-testid="savedSearchDiv"]').contains('Unread').click();
    cy.get('[data-testid="savedSearchDiv"]')
      .eq(1)
      .find('div:last()')
      .then((val) => {
        if (val[0].innerText === '0') {
          cy.get("div[data-testid='listingContainer'] > ul")
            .find('[data-testid="empty-result"]')
            .should('contain', 'Sorry, no results found!');
        } else {
          cy.get("div[data-testid='listingContainer'] > ul").should(
            'not.contain',
            'You do not have any conversations.'
          );
        }
      });
  });

  it('Select searched contact', () => {
    cy.get('[data-testid="searchInput"]')
      .click({ force: true })
      .wait(500)
      .type('Glific Simulator One' + '{enter}')
      .wait(1000);

    cy.get('[data-testid="list"]').last().click({ force: true });
    cy.get('[data-testid="name"]')
      .first()
      .should('contain', 'Glific Simulator One')
      .click({ force: true });
    cy.get('h6').should('contain', 'Glific Simulator One');
  });

  it('Advanced search with name/tag/keyword', () => {
    cy.get('.MuiInputAdornment-root > .MuiButtonBase-root').click({
      force: true,
    });
    cy.wait(1000);
    cy.get('[data-testid="input"]').first().click().wait(500).type('Glific Simulator One');
    cy.get('[data-testid="submitActionButton"]').click();

    cy.wait(1000);
    cy.get('[data-testid="name"]').first().should('contain', 'Glific Simulator One');
  });
});
