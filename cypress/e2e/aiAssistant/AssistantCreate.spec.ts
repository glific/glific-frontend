import { BELOW_STICKY_HEADER, V2_SERVICES, loginWithServices } from '../../utils/assistant-flow';

const NEW_ASSISTANT_ID = '42';
const CREATE_PATH = '/assistants/add';

const MODELS = [
  {
    __typename: 'KaapiModel',
    modelName: 'gpt-4.1',
    provider: 'openai',
    completionType: ['text'],
    config: JSON.stringify({
      temperature: { description: 'How adventurous the answers are.', min: 0, max: 2, default: 1 },
    }),
    badge: 'Recommended',
    category: 'recommended',
  },
  {
    __typename: 'KaapiModel',
    modelName: 'o3-mini',
    provider: 'openai',
    completionType: ['text'],
    config: JSON.stringify({
      effort: {
        description: 'How long it thinks before answering.',
        options: ['low', 'medium', 'high'],
        default: 'medium',
      },
    }),
    badge: null,
    category: 'all',
  },
];

const UPLOADED_FILE = {
  __typename: 'FilesearchFile',
  fileId: 'file-abc123',
  filename: 'sample.md',
  uploadedAt: '2026-01-01T00:00:00Z',
  fileSize: 2048,
};

const CREATED_ASSISTANT = {
  __typename: 'Assistant',
  id: NEW_ASSISTANT_ID,
  assistantId: 'asst_420000000000',
  name: 'Maternal Health Bot',
  newVersionInProgress: false,
  cloneStatus: null,
  model: 'gpt-4.1',
  instructions: 'You answer questions about antenatal care.',
  status: 'ready',
  temperature: 1,
  effort: null,
  vectorStore: null,
};

const FIRST_VERSION = {
  __typename: 'AssistantConfigVersion',
  id: 'v1',
  majorVersion: 1,
  minorVersion: 0,
  versionLabel: '1.0',
  model: 'gpt-4.1',
  prompt: 'You answer questions about antenatal care.',
  settings: { temperature: 1 },
  status: 'ready',
  isLive: true,
  description: null,
  insertedAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  vectorStore: null,
};

// the file upload goes out as multipart, so the operation name is in the raw body rather than in JSON
const isFileUpload = (body: unknown) =>
  typeof body === 'string' && body.includes('UploadFilesearchFile');

const stubAssistantApi = () => {
  cy.intercept('POST', Cypress.expose('backendUrl'), (req) => {
    if (isFileUpload(req.body)) {
      req.alias = 'uploadFile';
      req.reply({ body: { data: { uploadFilesearchFile: UPLOADED_FILE } } });
      return;
    }

    const operation = req.body?.operationName;
    if (!operation) {
      req.continue();
      return;
    }

    // every operation answers to its own name, so a test can wait on the one it cares about
    req.alias = operation;

    switch (operation) {
      case 'AssistantModels':
        req.reply({ body: { data: { kaapiModels: MODELS } } });
        return;

      case 'CreateAssistant':
        req.reply({
          body: {
            data: {
              createAssistant: {
                assistant: {
                  __typename: 'Assistant',
                  id: NEW_ASSISTANT_ID,
                  name: req.body.variables?.input?.name,
                },
                errors: null,
              },
            },
          },
        });
        return;

      case 'CreateKnowledgeBase':
        req.reply({
          body: {
            data: {
              createKnowledgeBase: {
                knowledgeBase: {
                  __typename: 'KnowledgeBase',
                  id: 'kb-1',
                  knowledgeBaseVersionId: 'kbv-1',
                  name: 'Maternal Health Bot',
                },
              },
            },
          },
        });
        return;

      case 'Assistant':
        req.reply({
          body: {
            data: { assistant: { __typename: 'AssistantResult', assistant: CREATED_ASSISTANT } },
          },
        });
        return;

      case 'AssistantVersions':
        req.reply({ body: { data: { assistantVersions: [FIRST_VERSION] } } });
        return;

      case 'GoldenQas':
        req.reply({ body: { data: { goldenQas: [] } } });
        return;

      case 'AiEvaluations':
        req.reply({ body: { data: { aiEvaluations: [] } } });
        return;

      default:
        req.continue();
    }
  });
};

const openCreatePage = () => {
  loginWithServices(V2_SERVICES);
  stubAssistantApi();

  cy.visit(CREATE_PATH);
  cy.get('[data-testid="assistantDetailContainer"]', { timeout: 10000 }).should('be.visible');
};

const openTab = (tab: string) => {
  cy.get(`[data-testid="tab-${tab}"]`).click(BELOW_STICKY_HEADER);
  return cy.get(`[data-testid="tabPanel-${tab}"]`).should('be.visible');
};

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
    stubAssistantApi();

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
    nameIt('Maternal Health Bot');
    writePrompt('You answer questions about antenatal care.');
  });

  it('sends the name, prompt and model the reader chose', () => {
    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    cy.wait('@CreateAssistant').then((interception) => {
      const input = interception.request.body.variables?.input;

      expect(input.name).to.eq('Maternal Health Bot');
      expect(input.instructions).to.eq('You answer questions about antenatal care.');
      expect(input.model).to.eq('gpt-4.1');
    });
  });

  it('opens the assistant it created, on its own version', () => {
    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    cy.location('pathname', { timeout: 10000 }).should('eq', `/assistants/${NEW_ASSISTANT_ID}`);
    cy.contains('Assistant created successfully').should('be.visible');

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
