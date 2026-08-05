describe('Flow', () => {
  beforeEach(function () {
    // login before each
    cy.login();
    cy.visit('/chat');
  });

  it('should start simulator', () => {
    cy.get('[data-testid="beneficiaryName"]').then((body) => {
      if (!body[0].innerText.includes('Glific Simulator')) {
        cy.get('[data-testid="simulatorIcon"]').click();
      }
    });
  });

  it('should trigger help flow', () => {
    cy.get('[data-testid="layout"]').then((body) => {
      if (body.find('[data-testid="clearIcon"]').length == 0) {
        cy.get('[data-testid="simulatorIcon"]').click();
      }
    });
    const old_msg_count = cy.get('*[data-testid="simulatorMessage"]').its('length');
    cy.get('[data-testid=simulatorInput]')
      .click()
      .type('help' + '{enter}');
    cy.get('[data-testid=simulatorInput]')
      .click()
      .type('1' + '{enter}');
    const new_msg_count = cy.get('*[data-testid="simulatorMessage"]').its('length');
    expect(new_msg_count).to.not.equal(old_msg_count);
  });

  it('should trigger activity flow', () => {
    cy.get('[data-testid="layout"]').then((body) => {
      if (body.find('[data-testid="clearIcon"]').length == 0) {
        cy.get('[data-testid="simulatorIcon"]').click();
      }
    });
    const old_msg_count = cy.get('*[data-testid="simulatorMessage"]').its('length');
    cy.get('[data-testid=simulatorInput]')
      .click()
      .type('activity' + '{enter}');
    cy.get('[data-testid=simulatorInput]')
      .click()
      .type('1' + '{enter}');
    const new_msg_count = cy.get('*[data-testid="simulatorMessage"]').its('length');
    expect(new_msg_count).to.not.equal(old_msg_count);
  });
});
