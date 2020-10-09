describe('Tag', () => {
  const tagName = 'Sample Tag_' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/tag');
  });

  it('should load tag list', () => {
    cy.get('h5').should('contain', 'Tags');
  });

  it('should create new tag', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.get('input[name=label]').type(tagName);
    cy.get('textarea:first').type('This is random tag description');
    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'Tag created successfully');
    cy.get('input[name=searchInput]').type(tagName + '{enter}');
    cy.get('div').should('contain', tagName);
  });

  it('should edit tag', () => {
    cy.get('input[name=searchInput]').type(tagName + '{enter}');
    cy.get('[data-testid=EditIcon]').click();
    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'Tag edited successfully');
  });

  it('should delete tag', () => {
    cy.get('input[name=searchInput]').type(tagName + '{enter}');
    cy.get('[data-testid=DeleteIcon]').click();
    cy.contains('Confirm').click();
    cy.get('div').should('contain', 'Tag deleted successfully');
  });
});
