Cypress.Commands.add('create_collection', (collectionName, isGroup = false) => {
  cy.visit(isGroup ? '/group/collection' : '/collection');

  cy.get('[data-testid="newItemButton"]').click();
  cy.wait(1000); //It's not the best way to wait for the dom to load, we need to find a better solution.
  cy.get('input[name=label]').click().wait(1000).type(collectionName);
  cy.get('[data-testid="submitActionButton"]').click();
  cy.get('div').should('contain', 'Collection created successfully!');
});
Cypress.Commands.add('delete_collection', (collectionName) => {
  cy.visit('/collection');
  cy.get('input[name=searchInput]').type(collectionName + '{enter}');
  cy.get('[data-testid=DeleteIcon]').click();
  cy.contains('Confirm').click();
  cy.get('div').should('contain', 'Collection deleted successfully');
});
