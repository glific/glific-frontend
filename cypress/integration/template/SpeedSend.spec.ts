describe('Speed Send', () => {
  const speedSendName = 'Random Speed Send ' + Math.random();

  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/speed-send');
  });

  it('should load speed send list', () => {
    cy.get('h5').should('contain', 'Speed sends');
  });

  it('should create new speed send', () => {
    cy.contains('CREATE SPEED SEND').click();
    cy.get('input[name=label]').type(speedSendName);
    cy.get('[contenteditable="true"]').click({ force: true }).type('Test speed send message');
    cy.contains('Save').click();
    cy.get('div').should('contain', 'Speed send created successfully');
  });

  it('should edit speed send', () => {});

  it('should delete speed send', () => {});
});
