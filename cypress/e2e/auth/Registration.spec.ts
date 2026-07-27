describe('Registration page', () => {
  beforeEach(function () {
    cy.visit('/registration');
  });

  it('Load the forgot password page', () => {
    cy.get('button').should('contain', 'Register with ');
  });

  it('Should be able to enter the values in form', () => {
    cy.env(['phone', 'password']).then(({ phone, password }) => {
      cy.get('input[type=text]').type('Test User');
      cy.get('input[type=tel]').type(phone);
      cy.get('input[type=password]').type(password);

      cy.get('input[type=text]').should('have.attr', 'value', 'Test User');
      cy.get('input[type=tel]').should('have.attr', 'value', '+91' + phone);
      cy.get('input[type=password]').should('have.attr', 'value', password);
    });
  });
});
