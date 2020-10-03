describe('Speed Send', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/speed-send');
  });

  it('should load speed send list', () => {
    cy.get('h5').should('contain', 'Speed sends');
  });

  it('should create new speed send', () => {});

  it('should edit speed send', () => {});

  it('should delete speed send', () => {});
});
