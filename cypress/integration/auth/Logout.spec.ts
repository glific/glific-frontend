describe('Chats', () => {
  it('should logout correctly', () => {
    // let's login
    cy.login();
    // navigate to chat
    cy.visit('/chat');
    // click on profile menu
    cy.get('[data-testid="profileMenu"]').click();
    // click on logout
    cy.contains('Logout').click();
    // assert if we are actually logged out
    cy.get('h4').should('contain', 'Login to your account');
  });
});
