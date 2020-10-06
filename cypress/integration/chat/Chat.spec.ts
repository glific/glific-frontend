describe('Chats', () => {
  beforeEach(function () {
    // login before each test
    cy.login();
    cy.visit('/chat');
  });
  it('should load the correct message', () => {});
  it('should send the correct message', () => {});
  it('should tag the message correctly', () => {});
  it('should remove message tag correctly', () => {});
  it('should send the speed send', () => {});
  it('should send add to speed send', () => {});
});
