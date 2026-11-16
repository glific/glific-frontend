import { BELOW_STICKY_HEADER, SEARCH_FIELD, loginWithServices } from '../../utils/assistant-flow';
import {
  editPrompt,
  nameAssistant,
  openTab,
  saveVersion,
  selectVersion,
  waitForAssistantPage,
} from '../../utils/assistant-detail';
import {
  contentSafetyReplyInput,
  guardrailRule,
  guardrailToggle,
  openContentSafetyReply,
  setContentSafetyReply,
  toggleGuardrail,
} from '../../utils/guardrail-actions';
import { CONTENT_SAFETY_REPLY, GUARDRAIL_SERVICES } from '../../utils/guardrail-fixtures';

const ASSISTANT_NAME = `E2E Assistant ${Date.now()}`;
const PROMPT =
  'You are a helpful assistant used in automated end-to-end tests. Answer in one short sentence.';
// a phrase the content safety model scores as toxic in English, so the reply comes back untranslated
const ABUSIVE_MESSAGE = 'fuck you';
const SET_REPLY_PHRASE = 'avoid using hurtful or abusive words';

const PAGE_TIMEOUT = 20000;
const BUILD_TIMEOUT_MS = 180000;
const BUILD_POLL_MS = 5000;
const REPLY_TIMEOUT = 90000;

let assistantPath = '';
let firstVersion = '';
let guardedVersion = '';

const openSavedAssistant = (version?: string) => {
  loginWithServices(GUARDRAIL_SERVICES);
  cy.visit(assistantPath);
  waitForAssistantPage(PAGE_TIMEOUT);
  if (version && version !== firstVersion) selectVersion(version);
  if (version) cy.get('[data-testid="versionPill"]').should('contain', `Version ${version}`);
};

const versionOnScreen = () =>
  cy
    .get('[data-testid="versionPill"]', { timeout: PAGE_TIMEOUT })
    .invoke('text')
    .then((text) => {
      const label = text.match(/Version (\d+\.\d+)/)?.[1];
      expect(label, 'version on screen').to.be.a('string');
      return label as string;
    });

// a version shows "In Progress" until the server has built it; the page does not refresh itself
const waitUntilBuilt = (version: string, deadline = Date.now() + BUILD_TIMEOUT_MS) => {
  cy.get('[data-testid="versionPill"]', { timeout: PAGE_TIMEOUT }).should(
    'contain',
    `Version ${version}`
  );
  cy.get('body').then(($body) => {
    if ($body.find(`[data-testid="failedPill-${version}"]`).length > 0) {
      throw new Error(`Version ${version} failed to build`);
    }
    if ($body.find(`[data-testid="inProgressPill-${version}"]`).length === 0) return;
    if (Date.now() > deadline) {
      throw new Error(
        `Version ${version} was still being prepared after ${BUILD_TIMEOUT_MS / 1000}s`
      );
    }

    cy.wait(BUILD_POLL_MS);
    openSavedAssistant(version);
    waitUntilBuilt(version, deadline);
  });
};

const sendInSandbox = (message: string) => {
  cy.get('[data-testid="sandboxInput"]').type(message);
  cy.get('[data-testid="sendMessageButton"]').click();
  cy.get('[data-testid="userMessage"]').last().should('contain', message);
};

const deleteThroughApi = (path: string) => {
  const id = path.split('/').pop();
  cy.window().then((win) => {
    const session = JSON.parse(win.localStorage.getItem('glific_session') ?? '{}');
    cy.request({
      method: 'POST',
      url: Cypress.expose('backendUrl'),
      headers: { authorization: session.access_token ?? '' },
      body: {
        operationName: 'DeleteAssistant',
        query:
          'mutation DeleteAssistant($deleteAssistantId: ID!) { deleteAssistant(id: $deleteAssistantId) { errors { message } } }',
        variables: { deleteAssistantId: id },
      },
      failOnStatusCode: false,
      log: false,
    });
  });
};

describe('an AI assistant, end to end against the real backend', () => {
  after(() => {
    // the last test deletes it through the page; this only cleans up after a failure before that
    if (!assistantPath) return;
    loginWithServices(GUARDRAIL_SERVICES);
    cy.visit('/assistants');
    deleteThroughApi(assistantPath);
  });

  it('creates an assistant with a knowledge base file', () => {
    loginWithServices(GUARDRAIL_SERVICES);
    cy.visit('/assistants/add');
    waitForAssistantPage(PAGE_TIMEOUT);

    nameAssistant(ASSISTANT_NAME);
    editPrompt(PROMPT);

    openTab('knowledgeBase');
    cy.get('[data-testid="fileInput"]').selectFile('cypress/fixtures/sample.md', { force: true });
    cy.get('[data-testid="knowledgeBaseFile"]', { timeout: 30000 }).should('contain', 'sample.md');

    saveVersion();

    cy.location('pathname', { timeout: 60000 }).should('match', /^\/assistants\/\d+$/);
    cy.contains('Assistant created successfully').should('be.visible');
    cy.get('[data-testid="headerTitle"]').should('contain', ASSISTANT_NAME);
    cy.location('pathname').then((path) => {
      assistantPath = path;
    });
    versionOnScreen().then((version) => {
      firstVersion = version;
    });
  });

  it('builds the first version with the file in its knowledge base', () => {
    openSavedAssistant();
    waitUntilBuilt(firstVersion);

    openTab('knowledgeBase');
    cy.get('[data-testid="knowledgeBaseFile"]').should('contain', 'sample.md');
  });

  it('loads the guardrails the server offers', () => {
    openSavedAssistant();
    openTab('guardrails');

    guardrailRule('content-safety', { timeout: PAGE_TIMEOUT }).should('contain', 'Content Safety');
    guardrailToggle('content-safety').should('not.be.checked');
  });

  it('saves Content Safety with a set reply as a new version', () => {
    openSavedAssistant();
    openTab('guardrails');

    toggleGuardrail('content-safety', { timeout: PAGE_TIMEOUT });
    setContentSafetyReply(CONTENT_SAFETY_REPLY);
    saveVersion();

    cy.contains('Changes saved successfully', { timeout: 30000 }).should('be.visible');
    // the page moves on to the version it just saved
    cy.get('[data-testid="versionPill"]', { timeout: 30000 }).should(
      'not.contain',
      `Version ${firstVersion}`
    );
    versionOnScreen().then((version) => {
      guardedVersion = version;
    });
  });

  it('keeps the set reply on the saved version', () => {
    openSavedAssistant(guardedVersion);
    waitUntilBuilt(guardedVersion);
    openTab('guardrails');

    guardrailToggle('content-safety', { timeout: PAGE_TIMEOUT }).should('be.checked');
    cy.get('[data-testid="editReplyToggle"]').should('contain', 'Reply set');
    openContentSafetyReply();
    contentSafetyReplyInput().should('have.value', CONTENT_SAFETY_REPLY);
  });

  it('answers an abusive message with the set reply, without asking the assistant', () => {
    openSavedAssistant(guardedVersion);
    openTab('tryItOut');

    sendInSandbox(ABUSIVE_MESSAGE);

    cy.get('[data-testid="assistantMessage"]', { timeout: REPLY_TIMEOUT }).should(
      'contain',
      SET_REPLY_PHRASE
    );
  });

  it('lets an ordinary message through to the assistant', () => {
    openSavedAssistant(guardedVersion);
    openTab('tryItOut');

    sendInSandbox('Hello, what can you help me with?');

    cy.get('[data-testid="assistantMessage"]', { timeout: REPLY_TIMEOUT })
      .should('not.contain', 'Could not get a reply')
      .and('not.contain', SET_REPLY_PHRASE)
      .invoke('text')
      .should('not.be.empty');
  });

  it('deletes the assistant from the list', () => {
    loginWithServices(GUARDRAIL_SERVICES);
    cy.visit('/assistants');
    cy.get(SEARCH_FIELD, { timeout: PAGE_TIMEOUT }).type(ASSISTANT_NAME, BELOW_STICKY_HEADER);

    cy.get('[data-testid="tableBody"] tr', { timeout: PAGE_TIMEOUT })
      .should('have.length', 1)
      .and('contain', ASSISTANT_NAME);
    cy.get('[data-testid="DeleteIcon"]').first().click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="dialogTitle"]').should('contain', ASSISTANT_NAME);
    cy.get('[data-testid="ok-button"]').click();

    cy.contains('Assistant deleted successfully', { timeout: 30000 }).should('be.visible');
    cy.contains('Sorry, no results found! Please try a different search.', {
      timeout: PAGE_TIMEOUT,
    }).should('be.visible');
    cy.then(() => {
      assistantPath = '';
    });
  });
});
