// Stubs the whole assistant API by operation name, so every spec can put the page in the state
// it wants to test. File uploads go out as multipart, where the operation name is in the raw body.
import { BELOW_STICKY_HEADER, V2_SERVICES, loginWithServices } from './assistant-flow';
import {
  ASSISTANT,
  ASSISTANT_ID,
  COMPLETED_RUN,
  DETAIL_PATH,
  DRAFT_VERSION_ID,
  FILE_DOWNLOAD_PATH,
  GOLDEN_SETS,
  GROUPED_SCORES,
  KNOWLEDGE_BASE,
  MODELS,
  RUN_SCORES,
  SET_ID,
  UPLOADED_FILE,
  VERSIONS,
} from './assistant-fixtures';

export const isMultipart = (body: unknown, operation: string) =>
  typeof body === 'string' && body.includes(operation);

export interface StubOptions {
  runs?: unknown[];
  chat?: 'answer' | 'pending' | 'error';
  fails?: string[];
  assistantMissing?: boolean;
  sets?: unknown[];
  scoresDelay?: number;
  models?: unknown[];
  scores?: string;
  groupedScores?: string;
  versions?: unknown[];
  vectorStore?: unknown;
  uploadDelay?: number;
}

export const stubAssistantApi = (options: StubOptions = {}) => {
  const {
    runs = [COMPLETED_RUN],
    scores = RUN_SCORES,
    groupedScores = GROUPED_SCORES,
    versions = VERSIONS,
    vectorStore = KNOWLEDGE_BASE,
    uploadDelay = 0,
    chat = 'answer',
    fails = [],
    assistantMissing = false,
    sets = GOLDEN_SETS,
    scoresDelay = 0,
    models = MODELS,
  } = options;

  cy.intercept('POST', Cypress.expose('backendUrl'), (req) => {
    if (isMultipart(req.body, 'UploadFilesearchFile')) {
      req.alias = 'uploadFile';
      req.reply({ body: { data: { uploadFilesearchFile: UPLOADED_FILE } }, delay: uploadDelay });
      return;
    }

    if (isMultipart(req.body, 'CreateGoldenQa')) {
      req.alias = 'CreateGoldenQa';
      req.reply({
        body: {
          data: {
            createGoldenQa: {
              goldenQa: { __typename: 'GoldenQa', id: 'g3', name: 'golden_qa', totalItems: 2 },
              errors: null,
            },
          },
        },
      });
      return;
    }

    const operation = req.body?.operationName;
    if (!operation) {
      req.continue();
      return;
    }

    // every operation answers to its own name, so a test can wait on the one it cares about
    req.alias = operation;

    // whatever the test asked to break answers with a server error instead
    if (fails.includes(operation)) {
      req.reply({ statusCode: 500, body: {} });
      return;
    }

    switch (operation) {
      case 'AssistantModels':
        req.reply({ body: { data: { kaapiModels: models } } });
        return;

      case 'Assistant':
        req.reply({
          body: {
            data: {
              assistant: assistantMissing
                ? null
                : { __typename: 'AssistantResult', assistant: { ...ASSISTANT, vectorStore } },
            },
          },
        });
        return;

      case 'AssistantVersions':
        req.reply({ body: { data: { assistantVersions: versions } } });
        return;

      case 'UpdateAssistant':
        req.reply({ body: { data: { updateAssistant: { errors: null } } } });
        return;

      case 'SetLiveVersion':
        req.reply({
          body: {
            data: {
              setLiveVersion: {
                assistant: {
                  __typename: 'LiveVersionAssistant',
                  id: ASSISTANT_ID,
                  activeConfigVersionId: DRAFT_VERSION_ID,
                  liveVersionLabel: '3.0',
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
                  knowledgeBaseVersionId: 'kbv-2',
                  name: 'VectorStore-maternal',
                },
              },
            },
          },
        });
        return;

      case 'GetFile':
        req.reply({
          body: {
            data: {
              getFile: {
                __typename: 'FilesearchFile',
                signedUrl: FILE_DOWNLOAD_PATH,
                filename: 'anc-guide.pdf',
                errors: null,
              },
            },
          },
        });
        return;

      case 'GoldenQas':
        req.reply({ body: { data: { goldenQas: sets } } });
        return;

      case 'GetGoldenQa':
        req.reply({
          body: {
            data: {
              goldenQa: {
                __typename: 'GoldenQaResult',
                goldenQa: {
                  __typename: 'GoldenQa',
                  id: SET_ID,
                  name: 'maternal_health_core',
                  signedUrl: 'https://files.example/golden-qa.csv',
                  totalItems: 120,
                  insertedAt: '2026-01-01T00:00:00Z',
                },
                errors: null,
              },
            },
          },
        });
        return;

      case 'AiEvaluations':
        // the history filter asks the same question with a golden QA on it, so it answers to its own name
        if (req.body.variables?.filter?.goldenQaId) req.alias = 'AiEvaluationsFiltered';
        req.reply({ body: { data: { aiEvaluations: runs } } });
        return;

      case 'EvaluationScores': {
        const grouped = req.body.variables?.exportFormat === 'grouped';
        req.reply({
          body: {
            data: {
              evaluationScores: {
                __typename: 'EvaluationScoresResult',
                scores: grouped ? groupedScores : scores,
                errors: null,
              },
            },
          },
          delay: scoresDelay,
        });
        return;
      }

      case 'ImproveEvaluationPrompt':
        req.reply({
          body: {
            data: {
              improveEvaluationPrompt: {
                __typename: 'ImprovePromptResult',
                improvePrompt: { __typename: 'ImprovePrompt', status: 'started' },
                errors: null,
              },
            },
          },
        });
        return;

      case 'createEvaluation':
        req.reply({
          body: {
            data: {
              createEvaluation: {
                evaluation: { __typename: 'CreateEvaluationResult', status: 'pending' },
                errors: null,
              },
            },
          },
        });
        return;

      case 'SendAssistantMessage':
        if (chat === 'error') {
          req.reply({ statusCode: 500, body: {} });
          return;
        }

        req.reply({
          body: {
            data: {
              sendAssistantMessage: {
                __typename: 'AssistantChatResult',
                // a reply that is still being worked on comes back without an answer, over the socket later
                answer:
                  chat === 'pending' ? null : 'Book the first check-up in the first trimester.',
                conversationId: 'c1',
                jobId: 'j1',
                requestId: 'req-1',
                errors: null,
              },
            },
          },
        });
        return;

      default:
        req.continue();
    }
  });
};

// opens the page without assuming it has an assistant, or versions, to show
export const openAssistantPage = (options: StubOptions = {}) => {
  loginWithServices(V2_SERVICES);
  stubAssistantApi(options);
  cy.visit(DETAIL_PATH);
};

export const openAssistant = (options: StubOptions = {}) => {
  openAssistantPage(options);

  cy.get('[data-testid="assistantDetailContainer"]', { timeout: 10000 }).should('be.visible');
  cy.get('[data-testid="versionPill"]').should('contain', 'Version 2.0');
};

export const openTab = (tab: string) => {
  cy.get(`[data-testid="tab-${tab}"]`).click(BELOW_STICKY_HEADER);
  return cy.get(`[data-testid="tabPanel-${tab}"]`).should('be.visible');
};

export const selectVersion = (label: string) => {
  cy.get('[data-testid="versionPill"]').click(BELOW_STICKY_HEADER);
  cy.get(`[data-testid="versionOption-${label}"]`).click();
};

export const editPrompt = (text: string) => {
  cy.get('[data-testid="promptInput"]').clear().type(text);
  cy.get('[data-testid="unsavedChanges"]').should('be.visible');
};
