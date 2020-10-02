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

  it('should edit tag', () => {});
  it('should delete tag', () => {});
});
