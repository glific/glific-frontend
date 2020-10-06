describe('Speed Send', () => {
  const speedSendName = 'Sample SpeedSend_' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/speed-send');
  });

  it('should load speed send list', () => {
    cy.get('h5').should('contain', 'Speed sends');
  });

  it('should create new speed send', () => {
    cy.contains('CREATE SPEED SEND').click();
    cy.get('input[name=label]').type(speedSendName);
    cy.get('.DraftEditor-editorContainer').click({ force: true });
    cy.get('.DraftEditor-editorContainer').type('Test speed send message');
    cy.contains('Save').click();
    cy.get('div').should('contain', 'Speed send created successfully');
  });

  it('should edit speed send', () => {
    cy.get('input[name=searchInput]').type(speedSendName + '{enter}');
    cy.get('[data-testid=EditIcon]').click();
    cy.contains('Save').click();
    cy.get('div').should('contain', 'Speed send edited successfully');
  });

  it('should delete speed send', () => {
    cy.get('input[name=searchInput]').type(speedSendName + '{enter}');
    cy.get('[data-testid=DeleteIcon]').click();
    cy.contains('Confirm').click();
    cy.get('div').should('contain', 'Speed send deleted successfully');
  });
});
