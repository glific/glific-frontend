describe('Importing contacts', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/contact-management');
  });

  it('should upload contacts', () => {
    cy.get('[data-testid="uploadContactsBtn"]').click();
    cy.wait(500);
    cy.get('[data-testid="autocomplete-element"]').click().type('Optin');
    cy.wait(500);
    cy.get('.MuiAutocomplete-popper').click();
    cy.get('input[name=optedIn]').click({ force: true });
    cy.get('input[type="file"]#uploadcontacts').selectFile('cypress/fixtures/contacts.csv', {
      force: true,
    });
    cy.get('[data-testid=ok-button]').click();
    cy.get('div').should('contain', 'Contact import is in progress');

    cy.get('button').contains('Go to notifications').click();
  });
});
