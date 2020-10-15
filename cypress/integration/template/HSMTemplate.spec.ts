describe('HSM Template', () => {
  const hsmTemplateName = 'Sample HSM Templates ' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/template');
  });

  it('should load template list', () => {
    cy.get('h5').should('contain', 'Templates');
  });

  it('should create new HSM template', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.get('input[name=label]').type(hsmTemplateName);
    cy.get('.DraftEditor-editorContainer').click({ force: true });
    cy.get('.DraftEditor-editorContainer').type('Test speed send message');
    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'HSM Template created successfully');
  });

  it('should edit hsm template', () => {
    cy.get('input[name=searchInput]').type(hsmTemplateName + '{enter}');
    cy.get('[data-testid=EditIcon]').click();
    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'HSM Template edited successfully');
  });

  it('should delete hsm template', () => {
    cy.get('input[name=searchInput]').type(hsmTemplateName + '{enter}');
    cy.get('[data-testid=DeleteIcon]').click();
    cy.contains('Confirm').click();
    cy.get('div').should('contain', 'HSM Template deleted successfully');
  });
});
