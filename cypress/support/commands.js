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
Cypress.Commands.add('login', (phone = '917834811114', password = 'secret1234') => {
  return cy
    .request({
      method: 'POST',
      url: Cypress.env('backendUrl') + '#q=cypress.io+cors',
      body: {
        user: {
          phone: phone,
          password: password,
        },
      },
    })
    .then((response) => {
      const session = JSON.stringify(response.body.data);
      localStorage.setItem('glific_session', session);
      localStorage.setItem('role', JSON.stringify(['Admin']));
    });
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
