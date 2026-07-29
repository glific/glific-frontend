describe('Login page', () => {
  beforeEach(function () {
    cy.visit('/login');
  });

  it('Load the login page', () => {
    cy.get('h4').should('contain', 'Login to your account');
  });

  it('Check validations', () => {
    cy.get('[data-testid="SubmitButton"]').click();
    cy.get('p').should('contain', 'Input required');
  });

  it('Redirect to forgot password form', () => {
    cy.contains('Forgot Password?').click();
    cy.get('h4').should('contain', 'Reset your password');
  });

  it('Redirect to Registration form', () => {
    cy.contains('Create a new account').click();
    cy.get('h4').should('contain', 'Create your new account');
  });

  // some issue in this case, need to check
  it('Successful login', () => {
    cy.env(['phone', 'password']).then(({ phone, password }) => {
      cy.get('input[type=tel]').type(phone);
      cy.get('input[type=password]').type(password);
      cy.get('[data-testid="SubmitButton"]').click();
      cy.get('div').should('contain', 'Contacts');
    });
  });
});
