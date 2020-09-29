describe('Login page', () => {
  it('Load the login page', () => {
    cy.visit('/');
    cy.get('h4').should('contain', 'Login to your account');
  });

  it('Check validations', () => {
    cy.contains('LOGIN').click();
    cy.get('p').should('contain', 'Input required');
  });

  it('Successful login', () => {
    cy.get('input[type=tel]').type('8450938576');
    cy.get('input[type=password]').type('secret1234');
    cy.contains('LOGIN').click();
    cy.get('h6').should('contain', 'Chats');
  });
});
