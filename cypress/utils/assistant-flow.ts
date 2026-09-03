export const V2_SERVICES = { aiEvaluationsEnabled: true, aiEvaluationV2Enabled: true };
export const BELOW_STICKY_HEADER = { scrollBehavior: 'center' } as const;
export const SEARCH_FIELD = '[data-testid="searchInput"] input';

export const loginWithServices = (services: Record<string, boolean>) => {
  cy.login();
  cy.window().then((win) => {
    win.localStorage.setItem('organizationServices', JSON.stringify(services));
  });
};

export const openAssistantList = () => {
  loginWithServices(V2_SERVICES);

  cy.intercept('POST', Cypress.expose('backendUrl'), (req) => {
    if (req.body?.operationName === 'Assistants') {
      req.alias = 'assistantsQuery';
    }
  });

  cy.visit('/assistants');
  cy.get('[data-testid="headerTitle"]', { timeout: 10000 }).should('contain', 'AI Assistants');

  return cy.wait('@assistantsQuery', { timeout: 15000 }).then((interception) => {
    const assistants = interception.response?.body?.data?.assistants ?? [];
    return assistants.length as number;
  });
};
