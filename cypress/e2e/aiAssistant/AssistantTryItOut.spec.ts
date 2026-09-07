import { BELOW_STICKY_HEADER } from '../../utils/assistant-flow';
import { ASSISTANT_ID, LIVE_VERSION_ID } from '../../utils/assistant-fixtures';
import { editPrompt, openAssistant, openTab } from '../../utils/assistant-detail';

describe('the Try It Out tab of a saved assistant', () => {
  beforeEach(() => {
    openAssistant();
    openTab('tryItOut');
  });

  it('says which version is being tested and which one real users get', () => {
    cy.get('[data-testid="testingNote"]').should('contain', 'Version 2.0');
    cy.get('[data-testid="sandboxEmpty"]').should('be.visible');
  });

  it('answers a question, as the version on screen', () => {
    cy.get('[data-testid="sandboxInput"]').type('When is the first check-up?');
    cy.get('[data-testid="sendMessageButton"]').click();

    cy.wait('@SendAssistantMessage').then((interception) => {
      const input = interception.request.body.variables?.input;

      expect(input.assistantId).to.eq(ASSISTANT_ID);
      expect(input.message).to.eq('When is the first check-up?');
      // the sandbox answers as the version being looked at, not as whichever one is live
      expect(input.configVersionId).to.eq(LIVE_VERSION_ID);
    });

    cy.get('[data-testid="userMessage"]').should('contain', 'When is the first check-up?');
    cy.get('[data-testid="assistantMessage"]').should('contain', 'Book the first check-up');
    cy.get('[data-testid="markdownAnswer"]').should('exist');
  });

  it('starts a fresh conversation on New chat', () => {
    cy.get('[data-testid="sandboxInput"]').type('When is the first check-up?');
    cy.get('[data-testid="sendMessageButton"]').click();
    cy.get('[data-testid="assistantMessage"]').should('be.visible');

    cy.get('[data-testid="newChatButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="sandboxEmpty"]').should('be.visible');
    cy.get('[data-testid="userMessage"]').should('not.exist');
  });

  it('will not chat against an edit that has not been saved', () => {
    openTab('persona');
    editPrompt('Answer in two sentences.');
    openTab('tryItOut');

    cy.get('[data-testid="tryItOutBlocker"]').should('contain', 'Save a version to try it out');
    cy.get('[data-testid="saveFromTryItOutButton"]').should('be.visible');
    cy.get('[data-testid="sandboxInput"]').should('not.exist');
  });
});

describe('the sandbox when the reply does not simply arrive', () => {
  it('keeps the question waiting while the reply is still being worked on', () => {
    openAssistant({ chat: 'pending' });
    openTab('tryItOut');

    cy.get('[data-testid="sandboxInput"]').type('When is the first check-up?');
    cy.get('[data-testid="sendMessageButton"]').click();

    cy.get('[data-testid="userMessage"]').should('be.visible');
    cy.get('[data-testid="pendingMessage"]').should('be.visible');
  });

  it('reports a send that failed, and keeps the question on screen', () => {
    openAssistant({ chat: 'error' });
    openTab('tryItOut');

    cy.get('[data-testid="sandboxInput"]').type('When is the first check-up?');
    cy.get('[data-testid="sendMessageButton"]').click();

    cy.get('[data-testid="userMessage"]').should('contain', 'When is the first check-up?');
    cy.get('[data-testid="assistantMessage"]').should('contain', 'Could not get a reply');
  });
});

describe('more of the sandbox', () => {
  beforeEach(() => {
    openAssistant();
    openTab('tryItOut');
  });

  it('sends the sample question from the empty state', () => {
    cy.get('[data-testid="sampleQuestionButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="userMessage"]').should('contain', 'What can you help me with?');
    cy.get('[data-testid="assistantMessage"]').should('be.visible');
  });

  it('suggests an evaluation once the chat has run on a while', () => {
    ['First question?', 'Second question?'].forEach((question) => {
      cy.get('[data-testid="sandboxInput"]').type(question);
      cy.get('[data-testid="sendMessageButton"]').click();
      cy.get('[data-testid="assistantMessage"]').should('exist');
    });

    // four messages in, with a Golden Q&A to run against, the sandbox stops being enough
    cy.get('[data-testid="evaluationNudge"]').should('be.visible');
    cy.get('[data-testid="tabPanel-tryItOut"]')
      .find('[data-testid="runEvaluationButton"]')
      .should('be.visible');
  });

  it('keeps the transcript when the reader leaves the tab and comes back', () => {
    cy.get('[data-testid="sandboxInput"]').type('When is the first check-up?');
    cy.get('[data-testid="sendMessageButton"]').click();
    cy.get('[data-testid="assistantMessage"]').should('be.visible');

    openTab('persona');
    openTab('tryItOut');

    cy.get('[data-testid="userMessage"]').should('contain', 'When is the first check-up?');
    cy.get('[data-testid="assistantMessage"]').should('be.visible');
  });
});

describe('a reply that takes its time', () => {
  it('owns up when a reply is taking a long time', () => {
    openAssistant({ chat: 'pending' });
    openTab('tryItOut');

    cy.clock(Date.now(), ['setTimeout', 'clearTimeout']);
    cy.get('[data-testid="sandboxInput"]').type('When is the first check-up?');
    cy.get('[data-testid="sendMessageButton"]').click();
    cy.get('[data-testid="pendingMessage"]').should('be.visible');

    // the note is only fair after half a minute of waiting
    cy.tick(31000);
    cy.get('[data-testid="slowReplyNote"]').should('be.visible');
  });
});
