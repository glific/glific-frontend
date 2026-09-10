export const ASSISTANT_ID = '7';
export const DETAIL_PATH = `/assistants/${ASSISTANT_ID}`;
export const LIVE_VERSION_ID = 'v-live';
export const DRAFT_VERSION_ID = 'v-draft';
export const SET_ID = 'g1';
export const RUN_ID = 'r1';

export const LIVE_PROMPT = 'You answer questions about antenatal care.';
export const DRAFT_PROMPT = 'You answer questions about antenatal care, in simple Hindi.';

export const MODELS = [
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

export const KNOWLEDGE_BASE = {
  __typename: 'VectorStore',
  id: 'kb-1',
  vectorStoreId: 'vs_maternal_health',
  knowledgeBaseVersionId: 'kbv-1',
  name: 'VectorStore-maternal',
  legacy: false,
  size: 32880,
  files: [{ __typename: 'FileInfo', id: 'file-1', name: 'anc-guide.pdf', fileSize: 32880 }],
};

export const ASSISTANT = {
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
  status: 'ready' as string,
  isLive,
  description: null,
  insertedAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  vectorStore: KNOWLEDGE_BASE as typeof KNOWLEDGE_BASE | null,
});

export type RunFixture = typeof COMPLETED_RUN;
export type VersionFixture = ReturnType<typeof version>;
export type ModelFixture = (typeof MODELS)[number];
export type GoldenQaFixture = (typeof GOLDEN_SETS)[number];

export const VERSIONS = [
  version(LIVE_VERSION_ID, '2.0', true, LIVE_PROMPT),
  version(DRAFT_VERSION_ID, '2.1', false, DRAFT_PROMPT),
];

export const GOLDEN_SETS = [
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

export const SUMMARY_SCORES = [
  { name: 'Adherence to Ground Truth', avg: 4.5 },
  { name: 'Adherence to Prompt', avg: 4.2 },
  { name: 'Adherence to Knowledge Base', avg: 4.1 },
];

export const COMPLETED_RUN = {
  __typename: 'AiEvaluation',
  id: RUN_ID,
  name: 'maternal_health_core_run',
  status: 'COMPLETED' as string,
  failureReason: null as string | null,
  results: JSON.stringify({ summary_scores: SUMMARY_SCORES }) as string | null,
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

export const DRAFT_RUN = {
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

export const RUN_SCORES = JSON.stringify({
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

export const LEGACY_KNOWLEDGE_BASE = { ...KNOWLEDGE_BASE, legacy: true };

export const LEGACY_VERSIONS = VERSIONS.map((entry) => ({
  ...entry,
  vectorStore: LEGACY_KNOWLEDGE_BASE,
}));

export const BUILDING_VERSIONS = [VERSIONS[0], { ...VERSIONS[1], status: 'in_progress' }];

export const FAILED_VERSIONS = [VERSIONS[0], { ...VERSIONS[1], status: 'failed' }];

export const RUNNING_RUN = { ...COMPLETED_RUN, id: 'r3', status: 'RUNNING', results: null };

export const FAILED_RUN = {
  ...COMPLETED_RUN,
  id: 'r4',
  status: 'FAILED',
  results: null,
  failureReason: 'The judge timed out',
};

export const WEAK_SCORES = JSON.stringify({
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

export const GROUPED_SCORES = JSON.stringify({
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

export const UNSCORED_SCORES = JSON.stringify({
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

export const EMPTY_SCORES = JSON.stringify({
  score: { overall: { overall_score: 4.32 }, traces: [] },
});

export const NO_PARAM_MODELS = [{ ...MODELS[0], config: JSON.stringify({}) }, MODELS[1]];

export const FILE_DOWNLOAD_PATH = '/files/anc-guide.pdf';

export const UPLOADED_FILE = {
  __typename: 'FilesearchFile',
  fileId: 'file-2',
  filename: 'sample.md',
  uploadedAt: '2026-01-03T00:00:00Z',
  fileSize: 2048,
};
