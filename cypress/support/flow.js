Cypress.Commands.add('deleteFlow', (name) => {
  // cy.get("[data-testid=resetButton]").click({ force: true });
  cy.wait(1000);
  cy.get('input[name=searchInput]')
    .click()
    .wait(500)
    .type(name + '{enter}');
  cy.get('[data-testid=MoreIcon]').first().click();
  cy.get('[data-testid=DeleteIcon]').first().click();
  cy.get('[data-testid="ok-button"]').click({ force: true });
});

Cypress.Commands.add('fetchList', () => {
  cy.get('temba-select').shadow().find('temba-field').find('div.selected').click({ force: true });
});

Cypress.Commands.add('selectFirstValFromList', (text) => {
  cy.get('temba-select')
    .eq(0)
    .shadow()
    .find('temba-field')
    .find('temba-options')
    .first()
    .shadow()
    .find('.options-container')
    .find('div')
    .contains(text)
    .click({ force: true });
});

Cypress.Commands.add('enterInput', () => {
  const element = cy
    .get('temba-completion')
    .shadow()
    .find('temba-field')
    .find('temba-textinput')
    .shadow()
    .find('temba-field')
    .find('div.input-container')
    .find('.textinput')
    .click({ force: true });
});

Cypress.Commands.add('startFlow', () => {
  cy.get('[data-testid="dropdownIcon"]').click();
  // only if 'start a flow' btn is enabled
  cy.get('[data-testid="dropdownIcon"]').click();
  // only if 'start a flow' btn is enabled
  cy.get('[data-testid="flowButton"]').then((btn) => {
    if (btn[0]['disabled'] == false) {
      cy.get('[data-testid="flowButton"]').click({ force: true });
      cy.get('[data-testid="autocomplete-element"]').click();
      cy.wait(500);
      cy.get('[data-testid="autocomplete-element"]').type('AB');
      cy.get('ul[role="listbox"]').find('li').contains('AB Test Workflow').click({ force: true });
      cy.get('[data-testid=ok-button]').click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="app"]').find('div').should('contain', 'Flow started successfully');
    }
  });
});
