describe('Chats', () => {
  const messageText = 'Sample Message for testing ' + +new Date();
  const speedSendTitle = 'Speed Send saved from chat ' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/chat');
  });
  it('should load the correct message', () => {
    cy.contains('[data-testid="list"]', 'Default receiver').click();
    cy.get('div').should('contain', 'Default message body');
  });

  it('should send the message correctly', () => {
    cy.get('.DraftEditor-editorContainer').click({ force: true });
    cy.get('.DraftEditor-editorContainer').type(messageText);
    cy.get('[data-testid="sendButton"]').click();
    cy.get('[data-testid="message"]').should('contain', messageText);
  });

  it('should tag the message correctly', () => {
    // find options next to the recently added message
    cy.contains('[data-testid="message"]', messageText).find('svg').click();
    cy.contains('Assign tag').click();
    cy.get('h2').should('contain', 'Assign tag to message');
    cy.get('[data-testid="autocomplete-element"]').click().type('Import');
    cy.contains('Important').click();
    cy.get('[data-testid="ok-button"]').click({ force: true });
    cy.get('div').should('contain', 'Tags added successfully');
  });

  it('should remove message tag correctly', () => {
    cy.get('[data-testid="tags"]').contains('Important').find('[data-testid="deleteIcon"]').click();
    cy.get('div').should('contain', 'Tag deleted successfully');
  });

  it('should send the speed send', () => {
    cy.get('[data-testid="shortcutButton"]').click();
    cy.get('[data-testid="templateItem"] :first').click();
    cy.get('[data-testid="sendButton"]').click();
    cy.get('div').should('contain', 'Please click on the link');
  });

  it('should send add to speed send', () => {
    cy.contains('[data-testid="message"]', messageText).find('svg').click();
    cy.contains('Add to speed sends').click();
    cy.get('[data-testid="templateInput"]').type(speedSendTitle);
    cy.get('[data-testid="ok-button"]').click({ force: true });
    cy.get('div').should('contain', 'Message has been successfully added to speed sends.');
  });
});
