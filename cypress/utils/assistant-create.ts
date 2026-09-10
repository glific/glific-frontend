import { V2_SERVICES, bodyMentions, loginWithServices } from './assistant-flow';
import { MODELS, UPLOADED_FILE } from './assistant-fixtures';

export const NEW_ASSISTANT_ID = '42';
export const CREATE_PATH = '/assistants/add';

export const CREATED_ASSISTANT = {
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

export const FIRST_VERSION = {
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

export const stubCreateAssistantApi = () => {
  let createdName = CREATED_ASSISTANT.name;

  cy.intercept('POST', Cypress.expose('backendUrl'), (req) => {
    if (bodyMentions(req.body, 'UploadFilesearchFile')) {
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
        createdName = req.body.variables?.input?.name ?? CREATED_ASSISTANT.name;
        req.reply({
          body: {
            data: {
              createAssistant: {
                assistant: { __typename: 'Assistant', id: NEW_ASSISTANT_ID, name: createdName },
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
            data: {
              assistant: {
                __typename: 'AssistantResult',
                assistant: { ...CREATED_ASSISTANT, name: createdName },
              },
            },
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

export const openCreatePage = () => {
  loginWithServices(V2_SERVICES);
  stubCreateAssistantApi();

  cy.visit(CREATE_PATH);
  cy.get('[data-testid="assistantDetailContainer"]', { timeout: 10000 }).should('be.visible');
};
