import { BELOW_STICKY_HEADER } from '../../utils/assistant-flow';
import {
  ASSISTANT_ID,
  COMPLETED_RUN,
  DRAFT_RUN,
  DRAFT_VERSION_ID,
} from '../../utils/assistant-fixtures';
import { openAssistant, selectVersion } from '../../utils/assistant-detail';

describe('publishing a version', () => {
  it('will not publish the version that is already live', () => {
    openAssistant();

    cy.get('[data-testid="publishButton"]').should('be.disabled');
  });

  it('warns that the draft was never evaluated, and still lets it go live', () => {
    openAssistant();
    selectVersion('2.1');
    cy.get('[data-testid="publishButton"]').should('be.enabled').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="publishVersionDialog"]').should('be.visible');
    cy.get('[data-testid="publishNotEvaluated"]').should('contain', 'never been evaluated');

    // the safe route is offered first, so going live anyway is the second button
    cy.get('[data-testid="ok-button"]').should('contain', 'Run an evaluation');
    cy.get('[data-testid="middle-button"]').click();

    cy.wait('@SetLiveVersion').then((interception) => {
      expect(interception.request.body.variables?.assistantId).to.eq(ASSISTANT_ID);
      expect(interception.request.body.variables?.versionId).to.eq(DRAFT_VERSION_ID);
    });
    cy.contains('Version published').should('be.visible');
  });

  it('takes an unevaluated version to a run instead of publishing it blind', () => {
    openAssistant();
    selectVersion('2.1');
    cy.get('[data-testid="publishButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="tab-evaluation"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="runEvaluationDialog"]').should('be.visible');
  });

  it('publishes an evaluated version, quoting how it scored', () => {
    openAssistant({ runs: [COMPLETED_RUN, DRAFT_RUN] });
    selectVersion('2.1');
    cy.get('[data-testid="publishButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="publishLastRun"]').should('contain', 'Last evaluated at 4.32');
    cy.get('[data-testid="ok-button"]').should('contain', 'Publish').click();

    cy.wait('@SetLiveVersion').then((interception) => {
      expect(interception.request.body.variables?.versionId).to.eq(DRAFT_VERSION_ID);
    });
  });

  it('is dismissed without publishing anything', () => {
    openAssistant();
    selectVersion('2.1');
    cy.get('[data-testid="publishButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="publishVersionDialog"]').should('be.visible');

    // the dialog deliberately has no cancel button, so it closes the way any dialog does
    cy.get('body').type('{esc}');

    cy.get('[data-testid="publishVersionDialog"]').should('not.exist');
    cy.get('[data-testid="liveNote"]').should('contain', 'Version 2.0 is live');
  });
});
