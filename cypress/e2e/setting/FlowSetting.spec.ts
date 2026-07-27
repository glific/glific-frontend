describe('Organization Settings', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/settings');
  });
  it('should add default flow', () => {
    cy.wait(500); // loading take time
    cy.get('[data-testid="setting-drawer"]').contains('Flows').click();
    cy.wait(500);

    cy.get('p').should('contain', 'Default flow');
    cy.get('[data-testid="formLayout"]').click({ force: true });
    cy.get('input[type=checkbox]')
      .as('checkbox')
      .invoke('is', ':checked')
      .then((initial) => {
        if (!initial) {
          // procedure to select default flow
          cy.get('@checkbox').check();
          cy.get('[data-testid="autocomplete-element"]').eq(2).click({ force: true }).type('Act');
          cy.contains('Activity').click();

          cy.get('[data-testid="autocomplete-element"]').eq(3).click({ force: true }).type('Sat');
          cy.contains('Saturday').click();
          cy.get('html').click();

          cy.get('[data-testid="time-picker"]')
            .eq(0)
            .find('button')
            .click({ multiple: true, force: true });
          cy.wait(500);
          cy.get('h2').eq(0).click();
          cy.get('h2').eq(2).click();
          cy.get('h6').eq(2).click();

          cy.get('html').click();

          cy.get('[data-testid="time-picker"]')
            .eq(1)
            .find('button')
            .click({ multiple: true, force: true });
          cy.wait(500);
          cy.get('h2').eq(0).click();
          cy.get('h2').eq(2).click();
          cy.get('h6').eq(2).click();

          cy.get('html').click();
          cy.get('[data-testid="autocomplete-element"]').eq(4).click({ force: true }).type('Hel');
          cy.contains('Help Workflow').click();
          cy.wait(500);
          cy.get('[data-testid="submitActionButton"]').click();
        } else {
          // just save data without choosing default flow
          cy.wait(4000);
          cy.get('[data-testid="submitActionButton"]').click();
        }
      });
  });
});
