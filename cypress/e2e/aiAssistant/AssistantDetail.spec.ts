import { BELOW_STICKY_HEADER, V2_SERVICES, loginWithServices } from '../../utils/assistant-flow';

const ASSISTANT_ID = '7';
const DETAIL_PATH = `/assistants/${ASSISTANT_ID}`;
const LIVE_VERSION_ID = 'v-live';
const DRAFT_VERSION_ID = 'v-draft';
const SET_ID = 'g1';
const RUN_ID = 'r1';

const LIVE_PROMPT = 'You answer questions about antenatal care.';
const DRAFT_PROMPT = 'You answer questions about antenatal care, in simple Hindi.';

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

const KNOWLEDGE_BASE = {
  __typename: 'VectorStore',
  id: 'kb-1',
  vectorStoreId: 'vs_maternal_health',
  knowledgeBaseVersionId: 'kbv-1',
  name: 'VectorStore-maternal',
  legacy: false,
  size: 32880,
  files: [{ __typename: 'FileInfo', id: 'file-1', name: 'anc-guide.pdf', fileSize: 32880 }],
};

const ASSISTANT = {
  __typename: 'Assistant',
  id: ASSISTANT_ID,
  assistantId: 'asst_700000000000',
  name: 'Maternal Health Bot',
  newVersionInProgress: false,
  cloneStatus: null,
  model: 'gpt-4.1',
  instructions: LIVE_PROMPT,
  status: 'ready',
  temperature: 1,
  effort: null,
  vectorStore: KNOWLEDGE_BASE,
};

const version = (id: string, label: string, isLive: boolean, prompt: string) => ({
  __typename: 'AssistantConfigVersion',
  id,
  majorVersion: Number(label.split('.')[0]),
  minorVersion: Number(label.split('.')[1]),
  versionLabel: label,
  model: 'gpt-4.1',
  prompt,
  settings: { temperature: 1 },
  status: 'ready',
  isLive,
  description: null,
  insertedAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  vectorStore: KNOWLEDGE_BASE,
});

const VERSIONS = [
  version(LIVE_VERSION_ID, '2.0', true, LIVE_PROMPT),
  version(DRAFT_VERSION_ID, '2.1', false, DRAFT_PROMPT),
];

const GOLDEN_SETS = [
  {
    __typename: 'GoldenQa',
    id: SET_ID,
    name: 'maternal_health_core',
    totalItems: 120,
    insertedAt: '2026-01-01T00:00:00Z',
  },
  {
    __typename: 'GoldenQa',
    id: 'g2',
    name: 'anc_followups',
    totalItems: 40,
    insertedAt: '2026-01-01T00:00:00Z',
  },
];

const SUMMARY_SCORES = [
  { name: 'Adherence to Ground Truth', avg: 4.5 },
  { name: 'Adherence to Prompt', avg: 4.2 },
  { name: 'Adherence to Knowledge Base', avg: 4.1 },
];

const COMPLETED_RUN = {
  __typename: 'AiEvaluation',
  id: RUN_ID,
  name: 'maternal_health_core_run',
  status: 'COMPLETED',
  failureReason: null,
  results: JSON.stringify({ summary_scores: SUMMARY_SCORES }),
  duplicationFactor: 1,
  goldenQa: {
    __typename: 'AiEvalGoldenQa',
    id: SET_ID,
    name: 'maternal_health_core',
    duplicationFactor: 1,
  },
  assistantConfigVersion: {
    __typename: 'AiEvalConfigVersion',
    id: LIVE_VERSION_ID,
    majorVersion: 2,
    minorVersion: 0,
    assistant: { __typename: 'AiEvalAssistant', id: ASSISTANT_ID, name: 'Maternal Health Bot' },
  },
  insertedAt: '2026-01-02T00:00:00Z',
  updatedAt: '2026-01-02T00:05:00Z',
};

const DRAFT_RUN = {
  ...COMPLETED_RUN,
  id: 'r2',
  name: 'maternal_health_core_draft_run',
  assistantConfigVersion: {
    __typename: 'AiEvalConfigVersion',
    id: DRAFT_VERSION_ID,
    majorVersion: 2,
    minorVersion: 1,
    assistant: { __typename: 'AiEvalAssistant', id: ASSISTANT_ID, name: 'Maternal Health Bot' },
  },
  insertedAt: '2026-01-03T00:00:00Z',
  updatedAt: '2026-01-03T00:05:00Z',
};

const RUN_SCORES = JSON.stringify({
  score: {
    overall: { overall_score: 4.32, ai_summary: 'Answers hold up well on antenatal questions.' },
    summary_scores: SUMMARY_SCORES,
    traces: [
      {
        question_id: 1,
        question: 'When is the first check-up?',
        ground_truth_answer: 'In the first trimester.',
        llm_answer: 'In the first trimester, ideally before 12 weeks.',
        scores: [
          { name: 'Adherence to Ground Truth', value: 5, comment: 'Matches the expected answer.' },
        ],
      },
      {
        question_id: 2,
        question: 'How much iron is needed?',
        ground_truth_answer: 'One tablet a day after the first trimester.',
        llm_answer: 'One tablet daily.',
        scores: [
          { name: 'Adherence to Ground Truth', value: 4, comment: 'Leaves out the timing.' },
        ],
      },
    ],
  },
});

const LEGACY_KNOWLEDGE_BASE = { ...KNOWLEDGE_BASE, legacy: true };

const LEGACY_VERSIONS = VERSIONS.map((entry) => ({ ...entry, vectorStore: LEGACY_KNOWLEDGE_BASE }));

const BUILDING_VERSIONS = [VERSIONS[0], { ...VERSIONS[1], status: 'in_progress' }];

const FAILED_VERSIONS = [VERSIONS[0], { ...VERSIONS[1], status: 'failed' }];

const RUNNING_RUN = { ...COMPLETED_RUN, id: 'r3', status: 'RUNNING', results: null };

const FAILED_RUN = {
  ...COMPLETED_RUN,
  id: 'r4',
  status: 'FAILED',
  results: null,
  failureReason: 'The judge timed out',
};

const WEAK_SCORES = JSON.stringify({
  score: {
    overall: { overall_score: 3.1, ai_summary: 'Answers drift on longer questions.' },
    summary_scores: [
      { name: 'Adherence to Ground Truth', avg: 3.4 },
      { name: 'Adherence to Prompt', avg: 3.2 },
      { name: 'Adherence to Knowledge Base', avg: 2.4 },
    ],
    traces: [
      {
        question_id: 1,
        question: 'When is the first check-up?',
        ground_truth_answer: 'In the first trimester.',
        llm_answer: 'Whenever you like.',
        scores: [{ name: 'Adherence to Ground Truth', value: 2, comment: 'Too vague.' }],
      },
    ],
  },
});

const GROUPED_SCORES = JSON.stringify({
  score: {
    overall: { overall_score: 4.32, ai_summary: 'Answers hold up well on antenatal questions.' },
    summary_scores: SUMMARY_SCORES,
    traces: [
      {
        question_id: 1,
        question: 'When is the first check-up?',
        ground_truth_answer: 'In the first trimester.',
        llm_answers: ['In the first trimester.', 'Before 12 weeks.'],
        scores: [
          [{ name: 'Adherence to Ground Truth', value: 5, comment: 'Matches.' }],
          [{ name: 'Adherence to Ground Truth', value: 4, comment: 'Close enough.' }],
        ],
      },
    ],
  },
});

const UNSCORED_SCORES = JSON.stringify({
  score: {
    overall: { overall_score: 3.1, ai_summary: 'Hard to say much from this run.' },
    summary_scores: [],
    traces: [
      {
        question_id: 1,
        question: 'When is the first check-up?',
        ground_truth_answer: 'In the first trimester.',
        llm_answer: 'In the first trimester.',
        scores: [],
      },
    ],
  },
});

const EMPTY_SCORES = JSON.stringify({ score: { overall: { overall_score: 4.32 }, traces: [] } });

const NO_PARAM_MODELS = [{ ...MODELS[0], config: JSON.stringify({}) }, MODELS[1]];

const FILE_DOWNLOAD_PATH = '/files/anc-guide.pdf';

const UPLOADED_FILE = {
  __typename: 'FilesearchFile',
  fileId: 'file-2',
  filename: 'sample.md',
  uploadedAt: '2026-01-03T00:00:00Z',
  fileSize: 2048,
};

const isMultipart = (body: unknown, operation: string) =>
  typeof body === 'string' && body.includes(operation);

interface StubOptions {
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

const stubAssistantApi = (options: StubOptions = {}) => {
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
const openAssistantPage = (options: StubOptions = {}) => {
  loginWithServices(V2_SERVICES);
  stubAssistantApi(options);
  cy.visit(DETAIL_PATH);
};

const openAssistant = (options: StubOptions = {}) => {
  openAssistantPage(options);

  cy.get('[data-testid="assistantDetailContainer"]', { timeout: 10000 }).should('be.visible');
  cy.get('[data-testid="versionPill"]').should('contain', 'Version 2.0');
};

const openTab = (tab: string) => {
  cy.get(`[data-testid="tab-${tab}"]`).click(BELOW_STICKY_HEADER);
  return cy.get(`[data-testid="tabPanel-${tab}"]`).should('be.visible');
};

const selectVersion = (label: string) => {
  cy.get('[data-testid="versionPill"]').click(BELOW_STICKY_HEADER);
  cy.get(`[data-testid="versionOption-${label}"]`).click();
};

const editPrompt = (text: string) => {
  cy.get('[data-testid="promptInput"]').clear().type(text);
  cy.get('[data-testid="unsavedChanges"]').should('be.visible');
};

describe('the assistant page', () => {
  beforeEach(() => {
    openAssistant();
  });

  it('opens on the live version, with the assistant it belongs to', () => {
    cy.get('[data-testid="headerTitle"]').should('contain', 'Maternal Health Bot');
    cy.get('[data-testid="assistantId"]').should('contain', 'asst_700000000000');
    cy.get('[data-testid="liveNote"]').should('contain', 'Version 2.0 is live');
    cy.get('[data-testid="tab-persona"]').should('have.attr', 'aria-selected', 'true');
  });

  it('renames the assistant', () => {
    cy.get('[data-testid="editNameButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="nameInput"]').clear().type('ANC Companion');
    cy.get('[data-testid="saveNameButton"]').click();

    cy.wait('@UpdateAssistant').then((interception) => {
      expect(interception.request.body.variables?.input?.name).to.eq('ANC Companion');
    });
  });

  it('leaves the name alone when the edit is cancelled', () => {
    cy.get('[data-testid="editNameButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="nameInput"]').clear().type('Something else');
    cy.get('[data-testid="cancelNameButton"]').click();

    cy.get('[data-testid="headerTitle"]').should('contain', 'Maternal Health Bot');
  });

  it('lists every version, with the live one marked and the last score beside it', () => {
    cy.get('[data-testid="versionPill"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="versionOption-2.0"]')
      .find('[data-testid="livePill"]')
      .should('contain', 'LIVE');
    cy.get('[data-testid="versionHealth-2.0"]').should('contain', 'Good 4.32');
    cy.get('[data-testid="versionOption-2.1"]').should('not.contain', 'LIVE');
  });

  it('loads the prompt of the version that is picked', () => {
    selectVersion('2.1');

    cy.get('[data-testid="versionPill"]').should('contain', 'Version 2.1');
    cy.get('[data-testid="promptInput"]').should('have.value', DRAFT_PROMPT);
  });
});

describe('editing on the Model & Prompt tab', () => {
  beforeEach(() => {
    openAssistant();
  });

  it('flags an edited prompt as unsaved', () => {
    editPrompt('Answer in two sentences.');

    cy.get('[data-testid="tabDirtyDot-persona"]').should('be.visible');
    cy.get('[data-testid="saveVersionButton"]').should('be.enabled');
    cy.get('[data-testid="discardButton"]').should('be.visible');
  });

  it('puts the saved prompt back when the edit is discarded', () => {
    editPrompt('Answer in two sentences.');

    cy.get('[data-testid="discardButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="dialogTitle"]').should('contain', 'Discard unsaved changes?');
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="promptInput"]').should('have.value', LIVE_PROMPT);
    cy.get('[data-testid="unsavedChanges"]').should('not.exist');
  });

  it('saves the prompt and model as a new version', () => {
    editPrompt('Answer in two sentences.');
    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    cy.wait('@UpdateAssistant').then((interception) => {
      const input = interception.request.body.variables?.input;

      expect(interception.request.body.variables?.updateAssistantId).to.eq(ASSISTANT_ID);
      expect(input.instructions).to.eq('Answer in two sentences.');
      expect(input.model).to.eq('gpt-4.1');
      expect(input.name).to.eq('Maternal Health Bot');
    });
    cy.contains('Changes saved successfully').should('be.visible');
  });

  it('counts a changed temperature as an edit', () => {
    cy.get('[data-testid="temperatureSlider"]').should('be.visible');
    cy.get('[data-testid="temperatureInput"]').clear().type('0.4');

    cy.get('[data-testid="unsavedChanges"]').should('be.visible');
    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    cy.wait('@UpdateAssistant').then((interception) => {
      expect(interception.request.body.variables?.input?.temperature).to.eq(0.4);
    });
  });

  it('swaps in the settings of a model that takes an effort instead', () => {
    cy.get('[data-testid="modelSelect"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="modelOption-o3-mini"]').click();

    cy.get('[data-testid="effortSegment"]').should('be.visible');
    cy.get('[data-testid="temperatureInput"]').should('not.exist');
    // the reader is told why the temperature disappeared
    cy.contains('This model does not take a temperature').should('be.visible');
  });

  it('asks before switching version with the edit unsaved', () => {
    editPrompt('Answer in two sentences.');

    cy.get('[data-testid="versionPill"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="versionOption-2.1"]').click();

    cy.get('[data-testid="dialogTitle"]').should('contain', 'Switch version?');
    cy.get('[data-testid="cancel-button"]').click();

    // the edit survives, and so does the version it was made on
    cy.get('[data-testid="versionPill"]').should('contain', 'Version 2.0');
    cy.get('[data-testid="promptInput"]').should('have.value', 'Answer in two sentences.');
  });
});

describe('the Knowledge Base tab of a saved assistant', () => {
  beforeEach(() => {
    openAssistant();
    openTab('knowledgeBase');
  });

  it('lists what the version already has attached', () => {
    cy.get('[data-testid="fileCount"]').should('contain', '1 file attached');
    cy.get('[data-testid="knowledgeBaseFile"]').should('contain', 'anc-guide.pdf');
    cy.get('[data-testid="addFilesButton"]').should('be.enabled');
  });

  it('shows the knowledge base id behind the technical details', () => {
    cy.get('[data-testid="technicalDetailsToggle"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="vectorStoreId"]').should('contain', 'vs_maternal_health');
    cy.get('[data-testid="noVectorStore"]').should('not.exist');
  });

  it('asks the server for a link when a file is downloaded', () => {
    cy.intercept('GET', `**${FILE_DOWNLOAD_PATH}`, { body: 'the file' }).as('fileDownload');

    cy.get('[data-testid="downloadFileButton"]').first().click(BELOW_STICKY_HEADER);

    cy.wait('@GetFile').then((interception) => {
      expect(interception.request.body.variables?.fileId).to.eq('file-1');
    });
    cy.wait('@fileDownload');
  });

  it('saves an added file as a new knowledge base version', () => {
    cy.get('[data-testid="fileInput"]').selectFile('cypress/fixtures/sample.md', { force: true });
    cy.wait('@uploadFile');

    cy.get('[data-testid="knowledgeBaseFile"]').should('have.length', 2);
    cy.get('[data-testid="tabDirtyDot-knowledgeBase"]').should('be.visible');

    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    // the files go to the knowledge base first, and the version then points at it
    cy.wait('@CreateKnowledgeBase').then((interception) => {
      expect(interception.request.body.variables?.createKnowledgeBaseId).to.eq('kb-1');
      expect(interception.request.body.variables?.mediaInfo).to.have.length(2);
    });
    cy.wait('@UpdateAssistant').then((interception) => {
      expect(interception.request.body.variables?.input?.knowledgeBaseVersionId).to.eq('kbv-2');
    });
  });

  it('keeps a file that the reader decides not to remove', () => {
    cy.get('[data-testid="removeFileButton"]').first().click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="dialogTitle"]').should('contain', 'Remove anc-guide.pdf?');
    cy.get('[data-testid="cancel-button"]').click();

    cy.get('[data-testid="knowledgeBaseFile"]').should('contain', 'anc-guide.pdf');
    cy.get('[data-testid="unsavedChanges"]').should('not.exist');
  });
});

describe('the Golden Q&A Evaluation tab of a saved assistant', () => {
  beforeEach(() => {
    openAssistant();
    openTab('evaluation');
  });

  it('shows how the version scored last time', () => {
    cy.get('[data-testid="evaluationResult"]').should('be.visible');
    cy.get('[data-testid="overallScore"]').should('contain', '4.32');
    cy.get('[data-testid="scoreBand"]').should('contain', 'Good');
    cy.get('[data-testid="evaluationSummary"]').should('contain', 'Answers hold up well');
    cy.get('[data-testid="metric-groundTruth"]').should('be.visible');
    cy.get('[data-testid="scoreBar"]').should('have.length.greaterThan', 0);
  });

  it('lists the question-level results of that run', () => {
    cy.get('[data-testid="evaluationScores"]').should('be.visible');
    cy.get('[data-testid="evaluationScoreRow"]').should('have.length', 2);
    cy.get('[data-testid="evaluationScoreRow"]')
      .first()
      .should('contain', 'When is the first check-up?')
      .and('contain', 'In the first trimester.');
  });

  it('runs an evaluation against the set and duplication that were picked', () => {
    cy.get('[data-testid="runEvaluationButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="runEvaluationDialog"]').should('be.visible');

    // the set says how big the run is about to be, and the last one used is marked
    cy.get('[data-testid="setSize-g1"]').should('contain', '120 questions');
    cy.get('[data-testid="lastUsedSet"]').should('be.visible');

    cy.get('[data-testid="duplicationOption-5"]').click();
    cy.get('[data-testid="ok-button"]').click();

    cy.wait('@createEvaluation').then((interception) => {
      const input = interception.request.body.variables?.input;

      expect(input.goldenQaId).to.eq(SET_ID);
      expect(input.configId).to.eq(LIVE_VERSION_ID);
      expect(input.duplicationFactor).to.eq(5);
    });
    cy.contains('Evaluation started').should('be.visible');
  });

  it('manages the Golden Q&A sets from the same tab', () => {
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="manageGoldenQaSetsDialog"]').should('be.visible');
    cy.get('[data-testid="manageGoldenQaSet"]').should('have.length', GOLDEN_SETS.length);
    cy.get('[data-testid="goldenQaSetItems"]').first().should('contain', '120 questions');
    cy.get('[data-testid="addGoldenQaSetButton"]').should('be.visible');
  });

  it('opens a set to read the questions it holds', () => {
    cy.intercept('GET', 'https://files.example/golden-qa.csv', {
      body: 'question,answer\nWhen is the first check-up?,In the first trimester.',
    }).as('goldenQaFile');

    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="manageGoldenQaSet"]').first().click();

    cy.get('[data-testid="viewGoldenQaSetDialog"]').should('be.visible');
    cy.get('[data-testid="goldenQaViewRow"]').should('contain', 'When is the first check-up?');
  });

  it('lists past runs under History, and narrows them to one Golden Q&A', () => {
    cy.get('[data-testid="evaluationSubTabs-history"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="evaluationHistory"]').should('be.visible');
    cy.get('[data-testid="evaluationRun"]').should('have.length', 1);
    cy.get('[data-testid="evaluationRun"]').first().should('contain', 'maternal_health_core');

    cy.get('[data-testid="evaluationHistory"]')
      .find('[data-testid="dropdown"]')
      .find('[role="combobox"]')
      .click();
    cy.get('[data-testid="historyFilterMenu"]').contains('maternal_health_core').click();

    cy.wait('@AiEvaluationsFiltered').then((interception) => {
      expect(interception.request.body.variables?.filter?.goldenQaId).to.eq(SET_ID);
    });
  });
});

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

describe('versions that are not ready', () => {
  it('says a version is still being built, and will not test or publish it', () => {
    openAssistant({ versions: BUILDING_VERSIONS });
    selectVersion('2.1');

    cy.get('[data-testid="inProgressPill-2.1"]').should('be.visible');
    cy.get('[data-testid="publishButton"]').should('be.disabled');
    cy.get('[data-testid="liveNote"]').should('contain', 'This version is still being prepared');

    openTab('tryItOut');
    cy.get('[data-testid="tryItOutBlocker"]').should(
      'contain',
      'This version is still being prepared'
    );
  });

  it('says a version failed to build, and offers the way back', () => {
    openAssistant({ versions: FAILED_VERSIONS });
    selectVersion('2.1');

    cy.get('[data-testid="failedPill-2.1"]').should('be.visible');
    cy.get('[data-testid="publishButton"]').should('be.disabled');

    openTab('tryItOut');
    cy.get('[data-testid="tryItOutBlocker"]').should('contain', 'This version failed to build');
    cy.get('[data-testid="tabPanel-tryItOut"]')
      .find('[data-testid="goToPersonaButton"]')
      .should('be.visible');
  });

  it('switches version once the reader confirms, leaving the edit behind', () => {
    openAssistant();
    editPrompt('Answer in two sentences.');

    cy.get('[data-testid="versionPill"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="versionOption-2.1"]').click();
    cy.get('[data-testid="dialogTitle"]').should('contain', 'Switch version?');
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="versionPill"]').should('contain', 'Version 2.1');
    cy.get('[data-testid="promptInput"]').should('have.value', DRAFT_PROMPT);
    cy.get('[data-testid="unsavedChanges"]').should('not.exist');
  });
});

describe('a legacy knowledge base', () => {
  beforeEach(() => {
    openAssistant({ vectorStore: LEGACY_KNOWLEDGE_BASE, versions: LEGACY_VERSIONS });
    openTab('knowledgeBase');
  });

  it('is read-only, and says why', () => {
    cy.get('[data-testid="legacyNotice"]').should(
      'contain',
      'created before the knowledge base rewrite'
    );
    cy.get('[data-testid="legacyKnowledgeBaseInfo"]').should('be.visible');
    cy.get('[data-testid="addFilesButton"]').should('be.disabled');
  });

  it('offers neither download nor removal of its files', () => {
    cy.get('[data-testid="downloadFileButton"]').should('not.exist');
    cy.get('[data-testid="removeFileButton"]').should('not.exist');
    cy.get('[data-testid="supportedFormats"]').should('not.exist');
  });
});

describe('attaching files to the knowledge base', () => {
  it('refuses a file bigger than the limit', () => {
    openAssistant();
    openTab('knowledgeBase');

    cy.get('[data-testid="fileInput"]').selectFile(
      { contents: Cypress.Buffer.alloc(21 * 1024 * 1024), fileName: 'huge.pdf' },
      { force: true }
    );

    cy.contains('is larger than').should('be.visible');
    cy.get('[data-testid="knowledgeBaseFile"]').should('have.length', 1);
  });

  it('shows a file while it is still uploading', () => {
    openAssistant({ uploadDelay: 1500 });
    openTab('knowledgeBase');

    cy.get('[data-testid="fileInput"]').selectFile('cypress/fixtures/sample.md', { force: true });

    cy.get('[data-testid="uploadingFile"]').should('be.visible');
    cy.get('[data-testid="fileCount"]').should('contain', 'processing');

    cy.get('[data-testid="knowledgeBaseFile"]', { timeout: 10000 }).should('have.length', 2);
    cy.get('[data-testid="uploadingFile"]').should('not.exist');
  });

  it('removes a file once the reader confirms', () => {
    openAssistant();
    openTab('knowledgeBase');

    cy.get('[data-testid="removeFileButton"]').first().click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="knowledgeBaseEmpty"]').should('be.visible');
    cy.get('[data-testid="fileCount"]').should('contain', '0 files attached');
    // the file only leaves the server when the next version is saved
    cy.get('[data-testid="unsavedChanges"]').should('be.visible');
  });
});

describe('an evaluation that is not a finished, scored run', () => {
  it('says a run is still going, on the tab as well as in the panel', () => {
    openAssistant({ runs: [RUNNING_RUN] });
    openTab('evaluation');

    cy.get('[data-testid="evaluationRunning"]').should('contain', 'Evaluation in progress');
    cy.get('[data-testid="tabRunningDot-evaluation"]').should('exist');
    cy.get('[data-testid="runEvaluationButton"]').should('be.disabled');
  });

  it('says why a run failed', () => {
    openAssistant({ runs: [FAILED_RUN] });
    openTab('evaluation');

    cy.get('[data-testid="evaluationFailed"]').should('contain', 'The judge timed out');
    cy.get('[data-testid="evaluationResult"]').should('not.exist');
  });
});

describe('adding a Golden Q&A from the evaluation tab', () => {
  beforeEach(() => {
    openAssistant();
    openTab('evaluation');
  });

  it('reads the file that was picked before it is uploaded', () => {
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="addGoldenQaSetButton"]').click();

    cy.get('[data-testid="goldenQaFileInput"]').selectFile('cypress/fixtures/golden-qa.csv', {
      force: true,
    });

    // the name comes from the file, and the questions are shown before anything is sent
    cy.get('[data-testid="goldenQaNameInput"]').should('have.value', 'golden_qa');
    cy.get('[data-testid="goldenQaParsed"]').should('contain', 'Parsed 2 questions');
  });

  it('uploads it and reports it added', () => {
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="addGoldenQaSetButton"]').click();
    cy.get('[data-testid="goldenQaFileInput"]').selectFile('cypress/fixtures/golden-qa.csv', {
      force: true,
    });
    cy.get('[data-testid="goldenQaParsed"]').should('be.visible');

    cy.get('[data-testid="ok-button"]').click();

    cy.wait('@CreateGoldenQa');
    cy.contains('Golden Q&A added').should('be.visible');
  });

  it('refuses a name the server would not take', () => {
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="addGoldenQaSetButton"]').click();
    cy.get('[data-testid="goldenQaFileInput"]').selectFile('cypress/fixtures/golden-qa.csv', {
      force: true,
    });

    cy.get('[data-testid="goldenQaNameInput"]').clear().type('Maternal Health!');
    cy.get('[data-testid="ok-button"]').click();

    cy.get('[data-testid="goldenQaNameError"]').should('contain', 'lowercase letters');
  });
});

describe('reading and exporting the results', () => {
  beforeEach(() => {
    openAssistant();
    openTab('evaluation');
  });

  it('groups the answers by question when asked to', () => {
    cy.get('[data-testid="evaluationScoreRow"]').should('have.length', 2);

    cy.get('[data-testid="scoresFormatToggle-grouped"]').click(BELOW_STICKY_HEADER);

    // grouped, the same question carries a column per answer it was given
    cy.get('[data-testid="evaluationScoreRow"]').should('have.length', 1);
    cy.contains('Answer 1').should('be.visible');
    cy.contains('Answer 2').should('be.visible');
  });

  it('exports the question-level results as a CSV', () => {
    cy.window().then((win) => {
      cy.stub(win.URL, 'createObjectURL').as('objectUrl').returns('blob:stub');
    });

    cy.get('[data-testid="exportScoresButton"]').click(BELOW_STICKY_HEADER);
    cy.get('@objectUrl').should('have.been.called');
  });

  it('explains what the Overall column means', () => {
    cy.get('[data-testid="evaluationSubTabs-history"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="historyOverallHint"]').trigger('mouseover', BELOW_STICKY_HEADER);

    cy.get('[role="tooltip"]').should('contain', 'weighted average');
  });

  it('exports the history as a CSV', () => {
    cy.get('[data-testid="evaluationSubTabs-history"]').click(BELOW_STICKY_HEADER);
    cy.window().then((win) => {
      cy.stub(win.URL, 'createObjectURL').as('objectUrl').returns('blob:stub');
    });

    cy.get('[data-testid="exportHistoryButton"]').click(BELOW_STICKY_HEADER);
    cy.get('@objectUrl').should('have.been.called');
  });
});

describe('the prompt suggestion under a run', () => {
  it('has nothing to suggest when the run scores well', () => {
    openAssistant();
    openTab('evaluation');

    cy.get('[data-testid="suggestedPromptNone"]').should('contain', 'Nothing to change');
  });

  it('names the weakest check and can be applied', () => {
    openAssistant({ scores: WEAK_SCORES });
    openTab('evaluation');

    cy.get('[data-testid="suggestedPrompt"]').scrollIntoView().should('be.visible');
    cy.get('[data-testid="whyThisChangeButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="whyThisChange"]').should('contain', 'knowledge base');

    cy.get('[data-testid="applySuggestionButton"]').click(BELOW_STICKY_HEADER);

    cy.wait('@ImproveEvaluationPrompt').then((interception) => {
      expect(interception.request.body.variables?.evaluationId).to.eq(RUN_ID);
    });
    cy.contains('Prompt improvement started').should('be.visible');
  });

  it('can be dismissed and brought back', () => {
    openAssistant({ scores: WEAK_SCORES });
    openTab('evaluation');

    cy.get('[data-testid="dismissSuggestionButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="suggestedPromptDismissed"]').should('contain', 'Suggestion dismissed');

    cy.get('[data-testid="restoreSuggestionButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="suggestedPrompt"]').scrollIntoView().should('be.visible');
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

describe('more of the Model & Prompt tab', () => {
  it('closes the expanded editor without touching the prompt', () => {
    openAssistant();

    cy.get('[data-testid="expandPromptButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="promptExpandedInput"]').clear().type('Something else entirely.');
    cy.get('[data-testid="cancel-button"]').click();

    cy.get('[data-testid="promptInput"]').should('have.value', LIVE_PROMPT);
    cy.get('[data-testid="unsavedChanges"]').should('not.exist');
  });

  it('saves the reasoning effort of a model that takes one', () => {
    openAssistant();

    cy.get('[data-testid="modelSelect"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="modelOption-o3-mini"]').click();
    cy.get('[data-testid="effortSegment-high"]').click();

    cy.get('[data-testid="saveVersionButton"]').click(BELOW_STICKY_HEADER);

    cy.wait('@UpdateAssistant').then((interception) => {
      const input = interception.request.body.variables?.input;

      expect(input.model).to.eq('o3-mini');
      expect(input.effort).to.eq('high');
      // the model takes no temperature, so none is sent
      expect(input.temperature).to.eq(undefined);
    });
  });

  it('opens the prompt builder when the organisation has it', () => {
    loginWithServices({ ...V2_SERVICES, promptGeneratorEnabled: true });
    stubAssistantApi();
    cy.visit(DETAIL_PATH);
    cy.get('[data-testid="assistantDetailContainer"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-testid="generateWithAiButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="betaBanner"]').should('be.visible');
    cy.get('[data-testid="generatePromptButton"]').should('be.visible');
  });
});

describe('when the server does not answer', () => {
  it('says so plainly when the assistant cannot be loaded', () => {
    openAssistantPage({ assistantMissing: true });

    cy.get('[data-testid="assistantNotFound"]').should('contain', 'Assistant not found');
  });

  it('offers to try the Golden Q&A list again', () => {
    openAssistant({ fails: ['GoldenQas'] });
    openTab('evaluation');

    cy.get('[data-testid="goldenQaLoadError"]').should('contain', 'Golden Q&A could not be loaded');
    cy.get('[data-testid="retryGoldenQaButton"]').click(BELOW_STICKY_HEADER);
    cy.wait('@GoldenQas');
  });

  it('offers to try the run history again', () => {
    openAssistant({ fails: ['AiEvaluations'] });
    openTab('evaluation');

    cy.get('[data-testid="evaluationRunsLoadError"]').should(
      'contain',
      'Evaluation runs could not be loaded'
    );
    cy.get('[data-testid="retryRunsButton"]').should('be.visible');
  });

  it('says the question-level results could not be loaded', () => {
    openAssistant({ fails: ['EvaluationScores'] });
    openTab('evaluation');

    cy.get('[data-testid="evaluationScoresError"]').scrollIntoView().should('be.visible');
  });

  it('says so when a run produced no question-level rows', () => {
    openAssistant({ scores: EMPTY_SCORES });
    openTab('evaluation');

    cy.get('[data-testid="evaluationScoresEmpty"]').scrollIntoView().should('be.visible');
    cy.get('[data-testid="evaluationScoreRow"]').should('not.exist');
  });

  it('waits for the scores rather than showing a half-built card', () => {
    openAssistant({ scoresDelay: 1500 });
    openTab('evaluation');

    cy.get('[data-testid="evaluationScoreLoading"]').should('be.visible');
    cy.get('[data-testid="overallScore"]', { timeout: 10000 }).should('contain', '4.32');
  });
});

describe('an assistant with nothing run against it yet', () => {
  beforeEach(() => {
    openAssistant({ runs: [] });
    openTab('evaluation');
  });

  it('says this version has never been evaluated', () => {
    cy.get('[data-testid="noEvaluationsYet"]').should(
      'contain',
      'No evaluations yet for version 2.0'
    );
  });

  it('says the history is empty, and leads back to running one', () => {
    cy.get('[data-testid="evaluationSubTabs-history"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="evaluationHistoryEmpty"]').should('contain', 'No evaluations yet');
    cy.get('[data-testid="runFirstEvaluationButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="noEvaluationsYet"]').should('be.visible');
  });

  it('takes the reader from the run panel to the history', () => {
    cy.get('[data-testid="goToHistoryButton"]').click(BELOW_STICKY_HEADER);

    cy.get('[data-testid="evaluationHistoryEmpty"]').should('be.visible');
  });
});

describe('an assistant with no version saved', () => {
  it('says there is nothing published yet', () => {
    openAssistantPage({ versions: [] });
    cy.get('[data-testid="assistantDetailContainer"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-testid="noVersionPill"]').should('contain', 'No version saved yet');
    cy.get('[data-testid="liveNote"]').should('contain', 'Nothing published yet');
    cy.get('[data-testid="versionPill"]').should('not.exist');
  });
});

describe('reading a Golden Q&A set', () => {
  const openSet = () => {
    openAssistant();
    openTab('evaluation');
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="manageGoldenQaSet"]').first().click();
    return cy.get('[data-testid="viewGoldenQaSetDialog"]').should('be.visible');
  };

  it('reads the stored file back into a table', () => {
    cy.intercept('GET', 'https://files.example/golden-qa.csv', {
      body: 'question,answer\nWhen is the first check-up?,In the first trimester.\nHow much iron?,One a day.',
    });

    openSet();

    cy.get('[data-testid="goldenQaViewSummary"]').should('contain', 'maternal_health_core');
    cy.get('[data-testid="goldenQaViewTable"]').should('be.visible');
    cy.get('[data-testid="goldenQaViewRow"]').should('have.length', 2);
    cy.get('[data-testid="goldenQaViewRow"]').first().should('contain', 'In the first trimester.');

    // the server only takes question and answer, so a set never has a category column to show
    cy.get('[data-testid="goldenQaViewCategories"]').should('be.empty');
    cy.contains('th', 'Category').should('not.exist');
  });

  it('offers the export when the file cannot be read back', () => {
    cy.intercept('GET', 'https://files.example/golden-qa.csv', { statusCode: 403, body: '' });

    openSet();

    cy.get('[data-testid="goldenQaViewFallback"]').should('be.visible');
    cy.get('[data-testid="goldenQaViewFailureReason"]').should('contain', 'could not be read');
    cy.get('[data-testid="goldenQaViewDownloadButton"]').should('be.visible');
    // the count the server took at upload still stands in for the rows
    cy.get('[data-testid="goldenQaViewSummary"]').should('contain', '120 questions');
  });

  it('goes back to the list it was opened from', () => {
    cy.intercept('GET', 'https://files.example/golden-qa.csv', { body: 'question,answer\nQ1,A1' });

    openSet();
    cy.get('[data-testid="middle-button"]').click();

    cy.get('[data-testid="manageGoldenQaSetsDialog"]').should('be.visible');
    cy.get('[data-testid="goldenQaSetList"]').should('be.visible');
  });
});

describe('a Golden Q&A file that cannot be used', () => {
  it('refuses a CSV with no questions in it', () => {
    openAssistant();
    openTab('evaluation');
    cy.get('[data-testid="manageSetsButton"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="addGoldenQaSetButton"]').click();

    cy.get('[data-testid="goldenQaFileInput"]').selectFile(
      { contents: Cypress.Buffer.from('question,answer\n'), fileName: 'empty.csv' },
      { force: true }
    );

    cy.get('[data-testid="goldenQaFileError"]').should('contain', 'No questions found');
    cy.get('[data-testid="goldenQaParsed"]').should('not.exist');
  });
});

describe('the smaller things on the page', () => {
  it('copies the knowledge base id', () => {
    openAssistant();
    openTab('knowledgeBase');

    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').as('copy').resolves();
    });

    cy.get('[data-testid="technicalDetailsToggle"]').click(BELOW_STICKY_HEADER);
    cy.get('[data-testid="copyVectorStoreId"]').click();

    cy.get('@copy').should('have.been.calledWith', 'vs_maternal_health');
  });

  it('says when a model has nothing to tune', () => {
    openAssistant({ models: NO_PARAM_MODELS });

    cy.get('[data-testid="noModelParams"]').should('contain', 'no settings to tune');
    cy.get('[data-testid="temperatureInput"]').should('not.exist');
  });

  it('carries the judge’s reason beside each score', () => {
    openAssistant();
    openTab('evaluation');

    cy.get('[data-testid="scoreReason"]').first().should('exist');
    cy.get('[data-testid="evaluationScoresTable"]').scrollIntoView().should('be.visible');
  });

  it('has no suggestion to make when no check reported a score', () => {
    openAssistant({ scores: UNSCORED_SCORES });
    openTab('evaluation');

    cy.get('[data-testid="suggestedPromptUnscored"]').should(
      'contain',
      'No suggestion for this run'
    );
  });

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
