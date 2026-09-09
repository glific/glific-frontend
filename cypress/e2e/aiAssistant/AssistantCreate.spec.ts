import { BELOW_STICKY_HEADER, V2_SERVICES, loginWithServices } from '../../utils/assistant-flow';
import {
  CREATE_PATH,
  NEW_ASSISTANT_ID,
  openCreatePage,
  stubCreateAssistantApi,
} from '../../utils/assistant-create';
import { openTab } from '../../utils/assistant-detail';

const nameIt = (name: string) => {
  cy.get('[data-testid="editNameButton"]').click(BELOW_STICKY_HEADER);
  cy.get('[data-testid="nameInput"]').clear().type(name);
  cy.get('[data-testid="saveNameButton"]').click();
};

const writePrompt = (prompt: string) => {
  cy.get('[data-testid="promptInput"]').clear().type(prompt);
};

describe('starting a new assistant', () => {
  it('the create button on the list opens a blank assistant', () => {
    loginWithServices(V2_SERVICES);
    stubCreateAssistantApi();

    cy.visit('/assistants');
    cy.get('[data-testid="headingButton"]', { timeout: 10000 }).click(BELOW_STICKY_HEADER);

    cy.location('pathname').should('eq', CREATE_PATH);
    cy.get('[data-testid="assistantDetailContainer"]').should('be.visible');
    cy.get('[data-testid="headerTitle"]').should('contain', 'Untitled assistant');

    // nothing exists on the server yet, so there is no version and nothing to publish
    cy.get('[data-testid="newAssistantPill"]').should('be.visible');
    cy.get('[data-testid="publishButton"]').should('not.exist');
  });

  it('offers every tab of the new flow, starting on Model & Prompt', () => {
    openCreatePage();

    ['persona', 'knowledgeBase', 'guardrails', 'evaluation', 'tryItOut'].forEach((tab) => {
      cy.get(`[data-testid="tab-${tab}"]`).should('be.visible');
    });
    cy.get('[data-testid="tab-persona"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="tabPanel-persona"]').should('be.visible');
  });

  it('takes a name before anything is saved', () => {
    openCreatePage();
    nameIt('Maternal Health Bot');

    cy.get('[data-testid="headerTitle"]').should('contain', 'Maternal Health Bot');
    // the name alone is not a change to save — that comes with the first version
    cy.get('[data-testid="assistantId"]').should('not.exist');
  });
});

describe('the Model & Prompt tab', () => {
  beforeEach(() => {
    openCreatePage();
  });

  it('takes the prompt and flags the tab as unsaved', () => {
    writePrompt('You answer questions about antenatal care.');

    cy.get('[data-testid="tabDirtyDot-persona"]').should('be.visible');
    cy.get('[data-testid="unsavedChanges"]').should('be.visible');
    cy.get('[data-testid="saveVersionButton"]').should('be.enabled');
  });

  it('lists the models the server serves and loads the settings of the one picked', () => {
    // the recommended model is selected for a new assistant, and it takes a temperature
    cy.get('[data-testid="modelSelect"]').should('contain', 'gpt-4.1');
    cy.get('[data-testid="temperatureInput"]').should('exist');

    cy.get('[data-testid="modelSelect"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="modelSelect-menu"]').should('be.visible');
    cy.get('[data-testid="modelOption-o3-mini"]').click();

    // o3-mini takes an effort instead, so the temperature goes and the segment appears
    cy.get('[data-testid="modelSelect"]').should('contain', 'o3-mini');
    cy.get('[data-testid="effortSegment"]').should('be.visible');
    cy.get('[data-testid="temperatureInput"]').should('not.exist');
  });

  it('writes the prompt in the expanded editor', () => {
    cy.get('[data-testid="expandPromptButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="dialogBox"]').should('be.visible');

    cy.get('[data-testid="promptExpandedInput"]').clear().type('Reply in simple Hindi.');
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="promptInput"]').should('have.value', 'Reply in simple Hindi.');
  });
});

describe('the Knowledge Base tab', () => {
  beforeEach(() => {
    openCreatePage();
    openTab('knowledgeBase');
  });

  it('starts with nothing attached', () => {
    cy.get('[data-testid="fileCount"]').should('contain', '0 files attached');
    cy.get('[data-testid="knowledgeBaseEmpty"]').should('be.visible');
    cy.get('[data-testid="supportedFormats"]').should('be.visible');
    cy.get('[data-testid="addFilesButton"]').should('be.enabled');
  });

  it('attaches a file before the first version exists', () => {
    cy.get('[data-testid="fileInput"]').selectFile('cypress/fixtures/sample.md', { force: true });

    cy.wait('@uploadFile');
    cy.get('[data-testid="knowledgeBaseFile"]').should('contain', 'sample.md');
    cy.get('[data-testid="fileCount"]').should('contain', '1 file attached');

    // the file only reaches the server when the version is saved, so the tab is dirty until then
    cy.get('[data-testid="tabDirtyDot-knowledgeBase"]').should('be.visible');
  });

  it('takes an attached file back off', () => {
    cy.get('[data-testid="fileInput"]').selectFile('cypress/fixtures/sample.md', { force: true });
    cy.wait('@uploadFile');

    cy.get('[data-testid="removeFileButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="dialogTitle"]').should('contain', 'Remove sample.md?');
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="knowledgeBaseEmpty"]').should('be.visible');
    cy.get('[data-testid="fileCount"]').should('contain', '0 files attached');
  });

  it('has no knowledge base id to show yet', () => {
    cy.get('[data-testid="technicalDetailsToggle"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="noVectorStore"]').should('be.visible');
    cy.get('[data-testid="vectorStoreId"]').should('not.exist');
  });
});

describe('the Golden Q&A Evaluation tab', () => {
  beforeEach(() => {
    openCreatePage();
    openTab('evaluation');
  });

  it('asks for a Golden Q&A before anything can be evaluated', () => {
    cy.get('[data-testid="goldenQaEmpty"]').should('contain', 'Add Golden Q&A to evaluate');
    cy.get('[data-testid="addFirstSetButton"]').should('be.visible');
  });

  it('opens the upload dialog from the empty state', () => {
    cy.get('[data-testid="addFirstSetButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="addGoldenQaSetDialog"]').should('be.visible');
    cy.get('[data-testid="goldenQaNameInput"]').should('be.visible');
    cy.get('[data-testid="goldenQaDropZone"]').should('be.visible');
  });
});

describe('the Try It Out tab', () => {
  beforeEach(() => {
    openCreatePage();
    openTab('tryItOut');
  });

  it('waits for a saved version before it will chat', () => {
    cy.get('[data-testid="tryItOutBlocker"]').should(
      'contain',
      'Save your first version to try it out'
    );
    cy.get('[data-testid="sandboxInput"]').should('not.exist');
  });

  it('sends the reader back to Model & Prompt to write one', () => {
    cy.get('[data-testid="tabPanel-tryItOut"]')
      .find('[data-testid="goToPersonaButton"]')
      .click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="tab-persona"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="tabPanel-persona"]').should('be.visible');
  });
});

describe('saving the first version', () => {
  beforeEach(() => {
    openCreatePage();
    nameIt('ANC Companion');
    writePrompt('You answer questions about antenatal care.');
  });

  it('sends the name, prompt and model the reader chose', () => {
    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    cy.wait('@CreateAssistant').then((interception) => {
      const input = interception.request.body.variables?.input;

      expect(input.name).to.eq('ANC Companion');
      expect(input.instructions).to.eq('You answer questions about antenatal care.');
      expect(input.model).to.eq('gpt-4.1');
    });
  });

  it('opens the assistant it created, on its own version', () => {
    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    cy.location('pathname', { timeout: 10000 }).should('eq', `/assistants/${NEW_ASSISTANT_ID}`);
    cy.contains('Assistant created successfully').should('be.visible');

    cy.get('[data-testid="headerTitle"]').should('contain', 'ANC Companion');
    cy.get('[data-testid="versionBar"]').should('be.visible');
    cy.get('[data-testid="versionPill"]').should('contain', 'Version 1.0');
    cy.get('[data-testid="newAssistantPill"]').should('not.exist');
  });

  it('asks before leaving with the version unsaved', () => {
    cy.get('[data-testid="back-button"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="dialogTitle"]').should('contain', 'Leave without saving?');
    cy.get('[data-testid="cancel-button"]').click();

    cy.location('pathname').should('eq', CREATE_PATH);
    cy.get('[data-testid="unsavedChanges"]').should('be.visible');
  });
});
