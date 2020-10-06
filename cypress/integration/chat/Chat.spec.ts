describe('Chats', () => {
  const messageText = 'Sample Message for testing ' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/chat');
  });
  it('should load the correct message', () => {
    cy.contains('Default receiver').click();
    cy.get('div').should('contain', 'Default message body');
  });

  it('should send the message correctly', () => {
    cy.get('.DraftEditor-editorContainer').click({ force: true });
    cy.get('.DraftEditor-editorContainer').type(messageText);
    cy.contains('Send').click();
    cy.get('[data-testid="message"]').should('contain', messageText);
  });

  it('should tag the message correctly', () => {
    // find options next to the recently added message
    cy.contains('[data-testid="message"]', messageText).find('svg').click();
    cy.contains('Assign tag').click();
    cy.get('h2').should('contain', 'Assign tag to message');
    cy.get('[data-testid="autocomplete-element"]').click().type('Import');
    cy.contains('Important').click();
    cy.get('[data-testid="ok-button"]').click();
  });

  // it('should remove message tag correctly', () => {});

  // it('should send the speed send', () => {});

  // it('should send add to speed send', () => {});
});
