describe('Tag', () => {
  const tagName = 'Random Tag ' + Math.random();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/tag');
  });

  it('should load tag list', () => {
    cy.get('h5').should('contain', 'Tags');
  });

  it('should create new tag', () => {
    cy.contains('CREATE TAG').click();
    cy.get('input[name=label]').type(tagName);
    cy.get('textarea:first').type('This is random tag description');
    cy.contains('Save').click();
    cy.get('div').should('contain', 'Tag created successfully');
    //cy.get('div').should('contain', tagName);
  });

  it('should edit tag', () => {
    //cy.get('input[name=searchInput]').type(tagName + '{enter}');
    cy.get('input[name=searchInput]').type('testing{enter}');
    cy.get('[data-testid=EditIcon]').click();
    cy.contains('Save').click();
    cy.get('div').should('contain', 'Tag edited successfully');
  });

  it('should delete tag', () => {
    //cy.get('input[name=searchInput]').type(tagName + '{enter}');
    cy.get('input[name=searchInput]').type('testing{enter}');
    cy.get('[data-testid=DeleteIcon]').click();
    cy.contains('Cancel').click();
    //cy.contains('Confirm').click();
    //cy.get('div').should('contain', 'Tag deleted successfully');
  });
});
