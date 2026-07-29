describe('Groups Collection', () => {
  const collectionName = 'WhatsApp Group Sample Collection ' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/group/collection');
  });

  it('should create new collection', () => {
    cy.create_collection(collectionName, true);
  });

  it('should edit collection', () => {
    cy.wait(500);
    cy.get('[data-testid=EditIcon]').first().click();
    cy.get('[data-testid="submitActionButton"]').first().click();
    cy.get('div').should('contain', 'Collection edited successfully!');
  });

  it('should delete collection', () => {
    cy.wait(500);
    cy.get('[data-testid=DeleteIcon]').first().click();
    cy.contains('Confirm').click();
    cy.get('div').should('contain', 'Collection deleted successfully');
  });
});
