describe('Group', () => {
  const groupName = 'Sample Group ' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/group');
  });

  it('should load group list', () => {
    cy.get('h5').should('contain', 'Groups');
  });

  it('should create new group', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.get('input[name=label]').type(groupName);
    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'Group created successfully!');
  });

  it('should edit group', () => {
    cy.get('input[name=searchInput]').type(groupName + '{enter}');
    cy.get('[data-testid=EditIcon]').click();
    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'Group edited successfully!');
  });

  it('should delete group', () => {
    cy.get('input[name=searchInput]').type(groupName + '{enter}');
    cy.get('[data-testid=DeleteIcon]').click();
    cy.contains('Confirm').click();
    cy.get('div').should('contain', 'Group deleted successfully');
  });
});
