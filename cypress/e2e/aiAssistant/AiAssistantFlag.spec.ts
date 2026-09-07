import { loginWithServices } from '../../utils/assistant-flow';

const openAssistantsWith = (services: Record<string, boolean>) => {
  loginWithServices(services);
  cy.visit('/assistants');
};

describe('AI Assistant flow selection', () => {
  it('opens the new assistant flow when the flag is on', () => {
    openAssistantsWith({ aiEvaluationsEnabled: true, aiEvaluationV2Enabled: true });

    cy.get('[data-testid="headerTitle"]', { timeout: 10000 }).should('contain', 'AI Assistants');
    cy.get('[data-testid="headingButton"]').should('contain', 'Create New Assistant');
    // the health column belongs to the new list only
    cy.get('[data-testid="tableHead"]').should('contain', 'Evaluation Health');
    cy.get('[data-testid="listHeader"]').should('not.exist');
  });

  it('keeps the previous assistants screen when the flag is off', () => {
    openAssistantsWith({ aiEvaluationV2Enabled: false });

    cy.get('[data-testid="listHeader"]', { timeout: 10000 }).should('contain', 'AI Assistants');
    cy.get('[data-testid="newItemButton"]').should('be.visible');
    cy.get('[data-testid="tableHead"]').should('not.contain', 'Evaluation Health');
  });

  it('refuses the new flow when AI evaluations are not enabled for the organisation', () => {
    // the flag routes here, but the gate still asks for evaluations to be on
    openAssistantsWith({ aiEvaluationsEnabled: false, aiEvaluationV2Enabled: true });

    cy.get('[data-testid="aiEvaluationV2Disabled"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="tableHead"]').should('not.exist');
  });

  it('takes the create button to a blank assistant in the new flow', () => {
    openAssistantsWith({ aiEvaluationsEnabled: true, aiEvaluationV2Enabled: true });

    cy.get('[data-testid="headingButton"]', { timeout: 10000 }).click();

    cy.location('pathname').should('eq', '/assistants/add');
    cy.get('[data-testid="newAssistantPill"]', { timeout: 10000 }).should(
      'contain',
      'New assistant'
    );
  });
});
