describe('Tag', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
  });

  it('Load Tag listing', () => {
    cy.visit('/tag');
  });
});
