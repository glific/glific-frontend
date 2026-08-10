describe('Forgot password page', () => {
  beforeEach(function () {
    cy.visit('/resetpassword-phone');
  });

  it('Load the forgot password page', () => {
    cy.get('h4').should('contain', 'Reset your password');
  });

  it('Check validations', () => {
    cy.get('[data-testid="SubmitButton"]').click();
    cy.get('p').should('contain', 'Input required');
  });

  it('Successful otp send', () => {
    cy.env(['phone']).then(({ phone }) => {
      cy.get('input[type=tel]').type(phone);
      cy.get('[data-testid="SubmitButton"]').click();
      cy.contains('Please confirm the OTP received at your WhatsApp number.');
    });
  });
});
