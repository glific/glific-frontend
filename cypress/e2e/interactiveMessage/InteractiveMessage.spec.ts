describe('Interactive message quick reply', () => {
  const interactiveMessageTitle = 'Sample interactive message ' + +new Date();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/interactive-message');
  });

  it('should create new quick reply', () => {
    cy.get('[data-testid="newItemButton"]').click();
    cy.wait(500); //It's not the best way to wait for the dom to load, we need to find a better solution.
    cy.get('input[name=title]').click().type(interactiveMessageTitle);

    cy.get("[data-testid='editor-body']").click({ force: true }).type('Test interactive message');

    cy.get("div[data-testid='addButton']").as('addNewButton');
    cy.get('@addNewButton').click();
    cy.get('@addNewButton').click();

    cy.get("div[data-testid='textField'] input").eq(0).click().type('Button 1');
    cy.get("div[data-testid='textField'] input").eq(1).click().type('Button 2');
    cy.get("div[data-testid='textField'] input").eq(2).click().type('Button 3');

    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'Interactive message created successfully!');
  });

  it('should load interactive message list', () => {
    cy.get("[data-testid='tableBody']").contains(interactiveMessageTitle);
  });

  it('should edit quick reply', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(1000) //It's not the best way to wait for the dom to load, we need to find a better solution.
      .type(interactiveMessageTitle + '{enter}');
    cy.get('[data-testid=EditIcon]').click();

    cy.get("div[data-testid='textField'] input").eq(0).click().type('3');

    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'Interactive message edited successfully!');
  });

  it('should autosave when switching language in edit mode', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(1000)
      .type('Are you excited for *Glific*?' + '{enter}');
    cy.get('[data-testid=EditIcon]').click();

    cy.wait(500);

    // Click on a different language tab to trigger autosave
    cy.get('body').then(($body) => {
      if ($body.find(':contains("Hindi")').length > 0) {
        cy.contains('Hindi').click();
        cy.get('div').should('contain', 'Your changes have been autosaved');
      }
    });
  });

  it('should show success notification on explicit save, not autosave', () => {
    cy.get('input[name=searchInput]')
      .click()
      .wait(1000)
      .type(interactiveMessageTitle + '{enter}');
    cy.get('[data-testid=EditIcon]').click();

    cy.wait(500);

    cy.get("div[data-testid='textField'] input").eq(0).click().clear().type('Updated Button');

    cy.get('[data-testid="submitActionButton"]').click();
    cy.get('div').should('contain', 'Interactive message edited successfully!');
    cy.get('div').should('not.contain', 'Your changes have been autosaved');
  });

  it('should delete quick reply message', () => {
    cy.wait(500);
    cy.get('input[name=searchInput]')
      .click()
      .wait(1000) //It's not the best way to wait for the dom to load, we need to find a better solution.
      .type(interactiveMessageTitle + '{enter}');
    cy.get('[data-testid=DeleteIcon]').click();
    cy.get('[data-testid=ok-button]').click();
    cy.get('div').should('contain', 'Interactive deleted successfully');
  });
});
