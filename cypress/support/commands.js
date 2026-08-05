// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- login command --
Cypress.Commands.add('login', (phone, password) => {
  const performLogin = (loginPhone, loginPassword) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.expose('backendUrl')}/v1/session`,
      body: {
        user: {
          phone: loginPhone,
          password: loginPassword,
        },
      },
    }).then((response) => {
      const session = JSON.stringify(response.body.data);
      const user = JSON.stringify({
        organization: { id: '1' },
        roles: [{ id: '1', label: 'Glific_admin' }],
      });
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('glific_session', session);
          win.localStorage.setItem('glific_user', user);
        },
      });
    });
  };

  if (phone !== undefined && password !== undefined) {
    performLogin(phone, password);
    return;
  }

  cy.env(['phone', 'password']).then(({ phone: envPhone, password: envPassword }) => {
    performLogin('91' + envPhone, envPassword);
  });
});

// --app login--
Cypress.Commands.add('appLogin', (phone, password, baseUrl = Cypress.config('baseUrl')) => {
  // baseUrl often has a trailing slash; avoid `//login` (parsed as protocol-relative → https://login/)
  cy.visit(`${String(baseUrl).replace(/\/+$/, '')}/login`);
  cy.get('input[type=tel]').type(phone);
  cy.get('input[type=password]').type(password);
  cy.get('[data-testid="SubmitButton"]').click();
  cy.get('div').should('contain', 'Chats');
});

//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
