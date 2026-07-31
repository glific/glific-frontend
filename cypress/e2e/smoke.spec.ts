describe('Flow smoke test', () => {
  after(() => {
    const tests = Cypress.mocha.getRunner().suite.tests;
    const passed = tests.length > 0 && tests.every((t) => t.state === 'passed');
    cy.task('reportInstatus', passed);
  });

  it('runs smoke-test flow and validates simulator responses', () => {
    cy.env(['smoke']).then(({ smoke }) => {
      cy.appLogin(smoke.phone, smoke.password, smoke.baseUrl);
      cy.visit(`${smoke.baseUrl.replace(/\/+$/, '')}/flow`);
      cy.get('[data-testid="searchInput"] [name="searchInput"]').click();
      cy.get('[data-testid="searchInput"] [name="searchInput"]').type('smoke-test{enter}');
      cy.get('[data-testid="tableBody"]').find('a').first().click();
      cy.get('[data-testid="previewButton"]').click();
      cy.get('[data-testid="simulatedMessages"]').should('be.visible');
      cy.wait(60000);
      cy.get('[data-testid="simulatedMessages"]')
        .find('[data-testid="simulatorMessage"]')
        .then(($messages) => {
          const today = new Date();
          const d = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const yyyy = today.getFullYear();
          const formattedDate = `${d}-${mm}-${yyyy}`;

          const lastThree = $messages.toArray().slice(-3);
          cy.wrap(lastThree[0]).within(() => {
            cy.get('audio').should('not.exist');
            cy.root().invoke('text').should('match', /\S/);
          });

          cy.wrap(lastThree[1]).within(() => {
            cy.get('[data-testid="audioMessage"]').should('exist');
          });

          cy.wrap(lastThree[2]).within(() => {
            cy.get('audio').should('not.exist');
            cy.contains('Test Finished').should('be.visible');
            cy.contains(formattedDate).should('be.visible');
          });
        });
    });
  });
});
