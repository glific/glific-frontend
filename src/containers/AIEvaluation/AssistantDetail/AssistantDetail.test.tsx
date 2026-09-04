import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import * as Notification from 'common/notification';
import * as Utils from 'common/utils';
import {
  CREATE_ASSISTANT,
  CREATE_KNOWLEDGE_BASE,
  SET_LIVE_VERSION,
  SEND_ASSISTANT_MESSAGE,
  UPDATE_ASSISTANT,
  UPLOAD_FILE_TO_KAAPI,
} from 'graphql/mutations/Assistant';
import {
  ASSISTANT_CHAT_RESPONSE,
  ASSISTANT_CONFIG_VERSION_UPDATED,
  KNOWLEDGE_BASE_VERSION_UPDATED,
} from 'graphql/subscriptions/Assistant';
import { IMPROVE_PROMPT_UPDATED } from 'graphql/subscriptions/AIEvaluations';
import { LIST_AI_EVALUATIONS, LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import { GET_ASSISTANT, GET_ASSISTANT_MODELS, GET_ASSISTANT_VERSIONS } from 'graphql/queries/Assistant';
import type { AssistantVersion } from 'containers/AIEvaluation/types/assistantType';
import { getAssistant } from 'mocks/Assistants';
import { rawModels } from './Tabs/PersonaPrompt/PersonaPrompt.test';
import AssistantDetail from './AssistantDetail';

const version = (major: number, isLive: boolean) => ({
  id: `v${major}`,
  majorVersion: major,
  minorVersion: 0,
  versionLabel: `${major}.0`,
  model: 'gpt-4o',
  prompt: 'You are a helpful assistant.',
  settings: { temperature: 1 } as { temperature: number } | string,
  status: 'ready',
  isLive,
  description: null as string | null,
  insertedAt: '2024-10-16T15:00:00Z' as string | null,
  updatedAt: '2024-10-16T15:00:00Z' as string | null,
  vectorStore: (isLive
    ? {
        id: 'vs-1',
        vectorStoreId: 'vs_abc123',
        knowledgeBaseVersionId: 'llm-vs-1',
        name: 'VectorStore-77ae3597',
        legacy: false,
        size: 32880,
        files: [{ name: 'Accelerator Guide (1).pdf', id: 'file-rls90OGDUgFeLewh6e01Eamf', fileSize: 32880 }],
      }
    : null) as AssistantVersion['vectorStore'],
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? key.replace(/{{(\w+)}}/g, (token, name) => (name in options ? String(options[name]) : token)) : key,
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
}));

const runMocks = (scoresByVersion: Record<string, number>) => {
  const runs = Object.entries(scoresByVersion).map(([versionId, score], index) => ({
    id: `run-${index}`,
    name: `run_${index}`,
    status: 'COMPLETED',
    failureReason: null,
    results: JSON.stringify({ summary_scores: [{ name: 'Adherence to Ground Truth', avg: score }] }),
    duplicationFactor: 1,
    goldenQa: { id: 'g1', name: 'core_set', duplicationFactor: 1 },
    assistantConfigVersion: {
      id: versionId,
      majorVersion: Number(versionId.replace('v', '')),
      minorVersion: 0,
      assistant: { id: '1', name: 'Assistant' },
    },
    insertedAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-10T10:05:00Z',
  }));

  return [
    {
      request: { query: LIST_GOLDEN_QA },
      variableMatcher: () => true,
      result: { data: { goldenQas: [] } },
      maxUsageCount: Number.POSITIVE_INFINITY,
    },
    {
      request: { query: LIST_AI_EVALUATIONS },
      variableMatcher: () => true,
      result: { data: { aiEvaluations: runs } },
      maxUsageCount: Number.POSITIVE_INFINITY,
    },
  ];
};

const confirmPublish = async () => {
  // the button opens the confirmation first; nothing has been evaluated in these tests, so the
  // dialog offers "Go live anyway" beside the nudge to run one
  await screen.findByTestId('publishVersionDialog');
  fireEvent.click(screen.getByTestId('middle-button'));
};

const versionsMock = (assistantVersions = [version(1, true), version(2, false)]) => ({
  request: { query: GET_ASSISTANT_VERSIONS, variables: { assistantId: '1' } },
  result: { data: { assistantVersions } },
});

const defaultMocks = () => [getAssistant('1'), versionsMock()];

// every render loads the model list, so the mock rides along with whatever else a test needs
const assistantModelsMock = {
  request: { query: GET_ASSISTANT_MODELS },
  result: { data: { kaapiModels: rawModels } },
  maxUsageCount: Number.POSITIVE_INFINITY,
};

const renderDetail = (path = '/assistants/1', mocks: any[] = defaultMocks()) =>
  render(
    <MockedProvider mocks={[...mocks, assistantModelsMock]}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/assistants" element={<div data-testid="list-page" />} />
          <Route path="/assistants/:assistantId" element={<AssistantDetail />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

describe('edit mode', () => {
  test('prefills the assistant name and id from the query', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('headerTitle')).toHaveTextContent('Assistant-405db438');
    });
    expect(screen.getByTestId('assistantId')).toHaveTextContent('asst_JhYmNWzpCVBZY2vTuohvmqjs');
  });

  test('renders the version bar and publish button', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Version 1.0 is live in your flows');
    expect(screen.getByTestId('publishButton')).toBeInTheDocument();
    // version 1 is live and selected by default, so there is nothing to publish
    expect(screen.getByTestId('publishButton')).toBeDisabled();
  });

  test('the greyed out publish button says on hover why it cannot be pressed', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('publishButton')).toBeDisabled();
    });

    // the button itself takes no pointer events while disabled, so the wrapper carries the hover
    fireEvent.mouseOver(screen.getByTestId('publishButton').parentElement as HTMLElement);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('This version is already live');
    });
  });

  test('publishing a draft version calls setLiveVersion and refetches the versions', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    const publishMock = {
      request: { query: SET_LIVE_VERSION, variables: { assistantId: '1', versionId: 'v2' } },
      result: {
        data: {
          setLiveVersion: {
            assistant: { id: '1', activeConfigVersionId: 'v2', liveVersionLabel: 2 },
            errors: null,
          },
        },
      },
    };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      publishMock,
      versionsMock([version(1, false), version(2, true)]),
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2.0'));

    await waitFor(() => {
      expect(screen.getByTestId('publishButton')).toBeEnabled();
    });
    fireEvent.click(screen.getByTestId('publishButton'));
    await confirmPublish();

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Version published — it is now live in your flows');
    });
    notificationSpy.mockRestore();
  });

  test('publishing lands the reader on the version it created', async () => {
    const publishMock = {
      request: { query: SET_LIVE_VERSION, variables: { assistantId: '1', versionId: 'v2' } },
      result: {
        data: {
          setLiveVersion: {
            assistant: { id: '1', activeConfigVersionId: 'v3', liveVersionLabel: '3.0' },
            errors: null,
          },
        },
      },
    };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      publishMock,
      // publishing promotes the version to the next major, so a new one comes back
      versionsMock([version(1, false), version(2, false), version(3, true)]),
    ]);

    fireEvent.click(await screen.findByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2.0'));

    await waitFor(() => expect(screen.getByTestId('publishButton')).toBeEnabled());
    fireEvent.click(screen.getByTestId('publishButton'));
    await confirmPublish();

    // without this the reader stays on 2.0 and has to find 3.0 in the dropdown themselves
    await waitFor(() => expect(screen.getByTestId('versionPill')).toHaveTextContent('3.0'));
  });

  test('the publish button cannot be fired twice while it is still publishing', async () => {
    const publishMock = {
      request: { query: SET_LIVE_VERSION, variables: { assistantId: '1', versionId: 'v2' } },
      delay: 50,
      result: {
        data: {
          setLiveVersion: {
            assistant: { id: '1', activeConfigVersionId: 'v2', liveVersionLabel: '2.0' },
            errors: null,
          },
        },
      },
    };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      publishMock,
      versionsMock([version(1, false), version(2, true)]),
    ]);

    fireEvent.click(await screen.findByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2.0'));

    const button = await screen.findByTestId('publishButton');
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    await confirmPublish();

    // a second publish of the same version would otherwise be one click away
    await waitFor(() => expect(button).toBeDisabled());
  });

  test('publishing a never evaluated version nudges an evaluation first', async () => {
    renderDetail();

    fireEvent.click(await screen.findByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2.0'));
    await waitFor(() => expect(screen.getByTestId('publishButton')).toBeEnabled());

    fireEvent.click(screen.getByTestId('publishButton'));

    const dialog = await screen.findByTestId('publishVersionDialog');
    // 1.0 and 2.0 already exist, so going live lands above both of them
    expect(screen.getByTestId('dialogTitle')).toHaveTextContent('Publish as Version 3.0?');
    expect(within(dialog).getByTestId('publishNotEvaluated')).toHaveTextContent('never been evaluated');
    expect(within(dialog).queryByTestId('publishLastRun')).not.toBeInTheDocument();

    // running one is the offer that leads; publishing stays available beside it
    expect(screen.getByTestId('ok-button')).toHaveTextContent('Run an evaluation');
    expect(screen.getByTestId('middle-button')).toHaveTextContent('Go live anyway');

    fireEvent.click(screen.getByTestId('ok-button'));

    // the reader lands on the tab that can actually run one
    await waitFor(() => {
      expect(screen.getByTestId('tab-evaluation')).toHaveAttribute('aria-selected', 'true');
    });
    expect(screen.queryByTestId('publishVersionDialog')).not.toBeInTheDocument();
  });

  test('backing out of the confirmation publishes nothing', async () => {
    const publishSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2.0'));
    await waitFor(() => expect(screen.getByTestId('publishButton')).toBeEnabled());

    fireEvent.click(screen.getByTestId('publishButton'));
    await screen.findByTestId('publishVersionDialog');
    // no Cancel button on this one — the close icon is the way out
    expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('close'));

    await waitFor(() => {
      expect(screen.queryByTestId('publishVersionDialog')).not.toBeInTheDocument();
    });
    expect(publishSpy).not.toHaveBeenCalled();
    publishSpy.mockRestore();
  });

  test('a publish that comes back with errors is reported', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const failingPublish = {
      request: { query: SET_LIVE_VERSION, variables: { assistantId: '1', versionId: 'v2' } },
      result: {
        data: {
          setLiveVersion: { assistant: null, errors: [{ key: 'version', message: 'Version not ready' }] },
        },
      },
    };

    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), failingPublish, versionsMock()]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2.0'));
    fireEvent.click(screen.getByTestId('publishButton'));
    await confirmPublish();

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith({ key: 'version', message: 'Version not ready' });
    });
    errorSpy.mockRestore();
  });

  test('shows a loader while the assistant is being fetched', () => {
    renderDetail();

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('the back button returns to the assistant list', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('back-button'));

    await waitFor(() => {
      expect(screen.getByTestId('list-page')).toBeInTheDocument();
    });
  });

  test('copies the assistant id to the clipboard on click', async () => {
    const copySpy = vi.spyOn(Utils, 'copyToClipboard').mockImplementation(() => {});
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('assistantId')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('assistantId'));

    expect(copySpy).toHaveBeenCalledWith('asst_JhYmNWzpCVBZY2vTuohvmqjs');
    copySpy.mockRestore();
  });

  test('copies the assistant id from the keyboard too', async () => {
    const copySpy = vi.spyOn(Utils, 'copyToClipboard').mockImplementation(() => {});
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('assistantId')).toBeInTheDocument();
    });

    fireEvent.keyDown(screen.getByTestId('assistantId'), { key: 'Enter' });

    expect(copySpy).toHaveBeenCalledWith('asst_JhYmNWzpCVBZY2vTuohvmqjs');
    copySpy.mockRestore();
  });

  test('falls back to defaults when the assistant has no model, temperature or name', async () => {
    const base = getAssistant('1');
    const sparse = {
      ...base,
      result: {
        data: {
          assistant: {
            ...base.result.data.assistant,
            assistant: {
              ...base.result.data.assistant.assistant,
              name: null,
              model: null,
              temperature: null,
              instructions: null,
            },
          },
        },
      },
    };

    // with no versions the editor falls back to the assistant record, and with no model on that
    // record either it starts on the one the server recommends
    renderDetail('/assistants/1', [sparse, versionsMock([])]);

    await waitFor(() => {
      expect(screen.getByTestId('modelSelect')).toHaveTextContent('gpt-5.6-luna');
    });

    fireEvent.click(screen.getByTestId('editNameButton'));
    expect(screen.getByTestId('nameInput')).toHaveValue('');
  });

  test('version rows fall back to insertedAt, and drop the timestamp when both are missing', async () => {
    const noUpdatedAt = { ...version(1, true), updatedAt: null };
    const noDates = { ...version(2, false), updatedAt: null, insertedAt: null };

    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([noUpdatedAt, noDates])]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));

    expect(await screen.findByTestId('versionOption-1.0')).toHaveTextContent(/published .*ago/);
    expect(screen.getByTestId('versionOption-2.0')).not.toHaveTextContent('ago');
  });

  test('shows a not-found message when the query errors', async () => {
    const errorMock = {
      request: { query: GET_ASSISTANT, variables: { assistantId: '1' } },
      error: new Error('Network error'),
    };
    renderDetail('/assistants/1', [errorMock, versionsMock()]);

    await waitFor(() => {
      expect(screen.getByTestId('assistantNotFound')).toBeInTheDocument();
    });
  });

  test('shows a not-found message when the assistant is missing', async () => {
    const emptyMock = {
      request: { query: GET_ASSISTANT, variables: { assistantId: '1' } },
      result: { data: { assistant: { __typename: 'AssistantResult', assistant: null } } },
    };
    renderDetail('/assistants/1', [emptyMock, versionsMock()]);

    await waitFor(() => {
      expect(screen.getByTestId('assistantNotFound')).toBeInTheDocument();
    });
  });
});

describe('renaming the assistant', () => {
  const updateMock = {
    request: {
      query: UPDATE_ASSISTANT,
      variables: { updateAssistantId: '1', input: { name: 'Renamed assistant' } },
    },
    result: { data: { updateAssistant: { errors: null } } },
  };

  const renamedAssistantMock = {
    ...getAssistant('1'),
    result: {
      data: {
        assistant: {
          ...getAssistant('1').result.data.assistant,
          assistant: { ...getAssistant('1').result.data.assistant.assistant, name: 'Renamed assistant' },
        },
      },
    },
  };

  const startEditing = async () => {
    await waitFor(() => {
      expect(screen.getByTestId('editNameButton')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('editNameButton'));
  };

  test('swaps the title for an editable input prefilled with the current name', async () => {
    renderDetail();
    await startEditing();

    expect(screen.getByTestId('nameInput')).toHaveValue('Assistant-405db438');
    expect(screen.queryByTestId('headerTitle')).not.toBeInTheDocument();
  });

  test('saves the new name and shows it in the header', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), updateMock, renamedAssistantMock]);
    await startEditing();

    fireEvent.change(screen.getByTestId('nameInput'), { target: { value: 'Renamed assistant' } });
    fireEvent.click(screen.getByTestId('saveNameButton'));

    await waitFor(() => {
      expect(screen.getByTestId('headerTitle')).toHaveTextContent('Renamed assistant');
    });
  });

  test('cancel leaves the original name untouched', async () => {
    renderDetail();
    await startEditing();

    fireEvent.change(screen.getByTestId('nameInput'), { target: { value: 'Discarded' } });
    fireEvent.click(screen.getByTestId('cancelNameButton'));

    expect(screen.getByTestId('headerTitle')).toHaveTextContent('Assistant-405db438');
  });

  test('a rename that comes back with errors keeps the editor open', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const failingRename = {
      request: {
        query: UPDATE_ASSISTANT,
        variables: { updateAssistantId: '1', input: { name: 'Renamed assistant' } },
      },
      result: { data: { updateAssistant: { errors: [{ message: 'Name taken', key: 'name' }] } } },
    };

    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), failingRename]);
    await startEditing();

    fireEvent.change(screen.getByTestId('nameInput'), { target: { value: 'Renamed assistant' } });
    fireEvent.click(screen.getByTestId('saveNameButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith({ message: 'Name taken', key: 'name' });
    });
    expect(screen.getByTestId('nameInput')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  test('a rename that throws is reported', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const networkError = {
      request: {
        query: UPDATE_ASSISTANT,
        variables: { updateAssistantId: '1', input: { name: 'Renamed assistant' } },
      },
      error: new Error('Network error'),
    };

    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), networkError]);
    await startEditing();

    fireEvent.change(screen.getByTestId('nameInput'), { target: { value: 'Renamed assistant' } });
    fireEvent.click(screen.getByTestId('saveNameButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });

  test('an unchanged or empty name closes the editor without calling the API', async () => {
    renderDetail();
    await startEditing();

    fireEvent.change(screen.getByTestId('nameInput'), { target: { value: '   ' } });
    fireEvent.click(screen.getByTestId('saveNameButton'));

    await waitFor(() => {
      expect(screen.getByTestId('headerTitle')).toHaveTextContent('Assistant-405db438');
    });
  });
});

describe('Unsaved changes', () => {
  const edit = async (value = 'Be concise.') => {
    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('promptInput'), { target: { value } });
  };

  test('shows Publish until something is edited', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('publishButton')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('unsavedChanges')).not.toBeInTheDocument();
  });

  test('swaps Publish for the unsaved pill, Discard and Save Version', async () => {
    renderDetail();
    await edit();

    expect(screen.getByTestId('unsavedChanges')).toHaveTextContent('Unsaved changes');
    expect(screen.getByTestId('discardButton')).toBeInTheDocument();
    expect(screen.getByTestId('saveVersionButton')).toBeInTheDocument();
    expect(screen.queryByTestId('publishButton')).not.toBeInTheDocument();
  });

  test('discard asks first, then restores the loaded values', async () => {
    renderDetail();
    await edit();

    fireEvent.click(screen.getByTestId('discardButton'));
    await waitFor(() => {
      expect(screen.getByText('Discard unsaved changes?')).toBeInTheDocument();
    });
    expect(screen.getByText(/Reverts the prompt, model, settings and knowledge base/)).toBeInTheDocument();
    expect(screen.getByText('Any edits made since your last save will be lost.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Discard changes'));

    await waitFor(() => {
      expect(screen.queryByTestId('unsavedChanges')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('promptInput')).toHaveValue('You are a helpful assistant.');
    expect(screen.getByTestId('publishButton')).toBeInTheDocument();
  });

  test('keep editing leaves the changes in place', async () => {
    renderDetail();
    await edit();

    fireEvent.click(screen.getByTestId('discardButton'));
    await waitFor(() => {
      expect(screen.getByText('Discard unsaved changes?')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Keep editing'));

    await waitFor(() => {
      expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('unsavedChanges')).toBeInTheDocument();
  });

  test('saving clears the unsaved state', async () => {
    const saveMock = {
      request: {
        query: UPDATE_ASSISTANT,
        variables: {
          updateAssistantId: '1',
          input: {
            instructions: 'Be concise.',
            model: 'gpt-4o',
            temperature: 1,
            name: 'Assistant-405db438',
          },
        },
      },
      result: { data: { updateAssistant: { errors: null } } },
    };

    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), saveMock, getAssistant('1'), versionsMock()]);
    await edit();

    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(screen.queryByTestId('unsavedChanges')).not.toBeInTheDocument();
    });
  });

  test('renaming a new assistant opens prefilled with the placeholder name', async () => {
    renderDetail('/assistants/add', []);

    await waitFor(() => {
      expect(screen.getByTestId('editNameButton')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('editNameButton'));

    const input = screen.getByTestId('nameInput') as HTMLInputElement;
    expect(input).toHaveValue('Untitled assistant');
    // preselected, so typing replaces it
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe('Untitled assistant'.length);

    fireEvent.change(input, { target: { value: 'Support bot' } });
    fireEvent.click(screen.getByTestId('saveNameButton'));

    await waitFor(() => {
      expect(screen.getByTestId('headerTitle')).toHaveTextContent('Support bot');
    });
  });

  const saveInput = {
    instructions: 'Be concise.',
    model: 'gpt-4o',
    temperature: 1,
    name: 'Assistant-405db438',
  };

  test('a save that comes back with errors keeps the unsaved state', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const failingSave = {
      request: { query: UPDATE_ASSISTANT, variables: { updateAssistantId: '1', input: saveInput } },
      result: { data: { updateAssistant: { errors: [{ message: 'Something went wrong', key: 'name' }] } } },
    };

    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), failingSave]);
    await edit();
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith({ message: 'Something went wrong', key: 'name' });
    });
    expect(screen.getByTestId('unsavedChanges')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  test('a save that throws is reported', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const networkError = {
      request: { query: UPDATE_ASSISTANT, variables: { updateAssistantId: '1', input: saveInput } },
      error: new Error('Network error'),
    };

    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), networkError]);
    await edit();
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });

  test('a save moves the selection onto the newly created version', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    const save = {
      request: { query: UPDATE_ASSISTANT, variables: { updateAssistantId: '1', input: saveInput } },
      result: { data: { updateAssistant: { errors: null } } },
    };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      save,
      getAssistant('1'),
      versionsMock([version(1, true), version(2, false), version(3, false)]),
    ]);
    await edit();
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Changes saved successfully');
    });
    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 3.0');
    });
    notificationSpy.mockRestore();
  });

  test('a save on an assistant with no versions selects the version it creates', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    const save = {
      request: { query: UPDATE_ASSISTANT, variables: { updateAssistantId: '1', input: saveInput } },
      result: { data: { updateAssistant: { errors: null } } },
    };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock([]),
      save,
      getAssistant('1'),
      versionsMock([version(1, false)]),
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('noVersionPill')).toBeInTheDocument();
    });
    await edit();
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Changes saved successfully');
    });
    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 1.0');
    });
    notificationSpy.mockRestore();
  });

  test('a cleared temperature is left out of the save payload', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    const saveWithoutTemperature = {
      request: {
        query: UPDATE_ASSISTANT,
        variables: {
          updateAssistantId: '1',
          // no `temperature` key at all — the schema would reject an empty string
          input: { instructions: 'You are a helpful assistant.', model: 'gpt-4o', name: 'Assistant-405db438' },
        },
      },
      result: { data: { updateAssistant: { errors: null } } },
    };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      saveWithoutTemperature,
      getAssistant('1'),
      versionsMock(),
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('temperatureInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '' } });
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Changes saved successfully');
    });
    notificationSpy.mockRestore();
  });

  test('saving a new assistant creates it and opens its page', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    const createMock = {
      request: {
        query: CREATE_ASSISTANT,
        variables: {
          input: { instructions: 'Hello', model: 'gpt-5.6-luna', effort: 'medium', name: 'Untitled assistant' },
        },
      },
      result: { data: { createAssistant: { assistant: { id: '7', name: 'Untitled assistant' }, errors: null } } },
    };

    renderDetail('/assistants/add', [createMock]);
    await edit('Hello');
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Assistant created successfully');
    });
    notificationSpy.mockRestore();
  });

  test('a failed create is reported and stays on the page', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const failingCreate = {
      request: {
        query: CREATE_ASSISTANT,
        variables: {
          input: { instructions: 'Hello', model: 'gpt-5.6-luna', effort: 'medium', name: 'Untitled assistant' },
        },
      },
      result: { data: { createAssistant: { assistant: null, errors: [{ message: 'Name taken', key: 'name' }] } } },
    };

    renderDetail('/assistants/add', [failingCreate]);
    await edit('Hello');
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith({ message: 'Name taken', key: 'name' });
    });
    expect(screen.getByTestId('unsavedChanges')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  test('create mode starts clean and shows no publish button', async () => {
    renderDetail('/assistants/add', []);

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('publishButton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('unsavedChanges')).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'Hello' } });

    expect(screen.getByTestId('unsavedChanges')).toBeInTheDocument();
    expect(screen.getByTestId('saveVersionButton')).toBeInTheDocument();
  });
});

describe('knowledge base', () => {
  const uploadedFile = { fileId: 'file-9', filename: 'guide.pdf', uploadedAt: '2026-08-04T10:00:00Z', fileSize: 2048 };

  const uploadMock = {
    request: { query: UPLOAD_FILE_TO_KAAPI },
    variableMatcher: () => true,
    result: { data: { uploadFilesearchFile: uploadedFile } },
  };

  const openTabAndUpload = async () => {
    await waitFor(() => {
      expect(screen.getByTestId('tab-knowledgeBase')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));

    const input = screen.getByTestId('fileInput');
    Object.defineProperty(input, 'files', {
      value: [new File(['x'], 'guide.pdf', { type: 'application/pdf' })],
      configurable: true,
    });
    fireEvent.change(input);
  };

  test('uploading marks the page dirty but does not attach anything yet', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), uploadMock]);
    await openTabAndUpload();

    // the assistant already ships with one file, so the upload makes two
    await waitFor(() => {
      expect(screen.getAllByTestId('knowledgeBaseFile')).toHaveLength(2);
    });
    expect(screen.getByTestId('fileCount')).toHaveTextContent('2 files attached');
    // no CREATE_KNOWLEDGE_BASE mock is provided — the attach must not have run
    expect(screen.getByTestId('unsavedChanges')).toBeInTheDocument();
  });

  test('an upload in progress survives switching tabs', async () => {
    // a slow upload so the tab switch happens while it is still in flight
    const slowUpload = {
      request: { query: UPLOAD_FILE_TO_KAAPI },
      variableMatcher: () => true,
      delay: 60,
      result: { data: { uploadFilesearchFile: uploadedFile } },
    };
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), slowUpload]);

    // edit first so the Save button exists to assert against
    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'Be concise.' } });

    await openTabAndUpload();
    expect(screen.getByTestId('uploadingFile')).toHaveTextContent('guide.pdf');
    // saving now would leave the in-flight file out of the version
    expect(screen.getByTestId('saveVersionButton')).toBeDisabled();

    fireEvent.click(screen.getByTestId('tab-persona'));
    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));

    // the progress row is still there instead of the list looking untouched
    expect(screen.getByTestId('uploadingFile')).toHaveTextContent('guide.pdf');

    await waitFor(() => {
      expect(screen.getAllByTestId('knowledgeBaseFile')).toHaveLength(2);
    });
    expect(screen.queryByTestId('uploadingFile')).not.toBeInTheDocument();
    expect(screen.getByTestId('saveVersionButton')).not.toBeDisabled();
  });

  test('discarding throws the uploaded file away', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), uploadMock]);
    await openTabAndUpload();

    await waitFor(() => {
      expect(screen.getAllByTestId('knowledgeBaseFile')).toHaveLength(2);
    });

    fireEvent.click(screen.getByTestId('discardButton'));
    fireEvent.click(await screen.findByText('Discard changes'));

    await waitFor(() => {
      expect(screen.queryByTestId('unsavedChanges')).not.toBeInTheDocument();
    });
    // back to the file the assistant was loaded with
    expect(screen.getAllByTestId('knowledgeBaseFile')).toHaveLength(1);
  });

  test('saving attaches the staged files, then updates the assistant', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    const createKnowledgeBaseMock = {
      request: {
        query: CREATE_KNOWLEDGE_BASE,
        variables: {
          createKnowledgeBaseId: 'vs-1',
          mediaInfo: [
            { fileId: 'file-rls90OGDUgFeLewh6e01Eamf', filename: 'Accelerator Guide (1).pdf', fileSize: 32880 },
            uploadedFile,
          ],
        },
      },
      result: {
        data: { createKnowledgeBase: { knowledgeBase: { id: 'kb-1', knowledgeBaseVersionId: 'kbv-9', name: 'kb' } } },
      },
    };
    const saveMock = {
      request: {
        query: UPDATE_ASSISTANT,
        variables: {
          updateAssistantId: '1',
          input: {
            // the editor is loaded from the live version, not the assistant record
            instructions: 'You are a helpful assistant.',
            model: 'gpt-4o',
            temperature: 1,
            knowledgeBaseVersionId: 'kbv-9',
            name: 'Assistant-405db438',
          },
        },
      },
      result: { data: { updateAssistant: { errors: null } } },
    };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      uploadMock,
      createKnowledgeBaseMock,
      saveMock,
      getAssistant('1'),
      versionsMock(),
    ]);
    await openTabAndUpload();

    await waitFor(() => {
      expect(screen.getAllByTestId('knowledgeBaseFile')).toHaveLength(2);
    });
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Changes saved successfully');
    });
    notificationSpy.mockRestore();
  });
});

describe('version dropdown', () => {
  test('defaults to the live version and marks it LIVE', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 1.0');
    });
    expect(screen.getByTestId('versionPill')).toHaveTextContent('LIVE');
  });

  test('lists every version, newest first, and switches on select', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('versionPill'));

    const options = await screen.findAllByRole('menuitem');
    expect(options.map((option) => option.textContent)).toEqual([
      expect.stringContaining('Version 2.0'),
      expect.stringContaining('Version 1.0'),
    ]);
    expect(
      screen.getByText('Saving creates a minor version. Publishing promotes it to the next major and makes it live.')
    ).toBeInTheDocument();

    // the draft reads "saved <ago>", the published one "published <ago>"; only the live one is badged
    expect(options[0]).toHaveTextContent(/saved .*ago/);
    expect(options[0]).not.toHaveTextContent('LIVE');
    expect(options[1]).toHaveTextContent(/LIVE.*published .*ago/);

    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 2.0');
    });
    expect(screen.getByTestId('versionPill')).not.toHaveTextContent('LIVE');
    // the live note keeps pointing at the published version, not the selected one
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Version 1.0 is live in your flows');
  });

  test('falls back to the latest version when nothing is published', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([version(1, false), version(2, false)])]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 2.0');
    });
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Nothing published yet');
  });

  test('shows a placeholder when the assistant has no versions yet', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([])]);

    await waitFor(() => {
      expect(screen.getByTestId('noVersionPill')).toHaveTextContent('No version saved yet');
    });
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Nothing published yet');
    expect(screen.queryByTestId('versionPill')).not.toBeInTheDocument();
    // an existing assistant is not "new", however few versions it has
    expect(screen.queryByTestId('newAssistantPill')).not.toBeInTheDocument();

    // with nothing saved there is no version to explain, so the button greys out without a tooltip
    expect(screen.getByTestId('publishButton')).toBeDisabled();
    fireEvent.mouseOver(screen.getByTestId('publishButton').parentElement as HTMLElement);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('create mode', () => {
  test('renders an empty shell with nothing prefilled', async () => {
    renderDetail('/assistants/add', []);

    await waitFor(() => {
      expect(screen.getByTestId('assistantDetailContainer')).toBeInTheDocument();
    });

    expect(screen.getByTestId('headerTitle')).toHaveTextContent('Untitled assistant');
    expect(screen.queryByTestId('assistantId')).not.toBeInTheDocument();
    expect(screen.getByTestId('newAssistantPill')).toHaveTextContent('New assistant');
    expect(screen.getByTestId('noVersionPill')).toHaveTextContent('No version saved yet');
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Nothing published yet');
    expect(screen.queryByTestId('versionPill')).not.toBeInTheDocument();
    expect(screen.queryByTestId('publishButton')).not.toBeInTheDocument();
  });
});

describe('tabs', () => {
  test('opens on Model & Prompt and switches panels on click', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('personaPrompt')).toBeInTheDocument();
    });
    expect(screen.getByTestId('tab-persona')).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByTestId('tab-evaluation'));

    expect(await screen.findByTestId('evaluationTab')).toBeInTheDocument();
    expect(screen.getByTestId('tab-evaluation')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('tab-persona')).toHaveAttribute('aria-selected', 'false');
  });

  test('renders every tab', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('tab-persona')).toBeInTheDocument();
    });

    ['persona', 'knowledgeBase', 'guardrails', 'evaluation', 'tryItOut'].forEach((key) => {
      expect(screen.getByTestId(`tab-${key}`)).toBeInTheDocument();
    });
  });

  test('tabs keep working in create mode', async () => {
    renderDetail('/assistants/add', []);

    await waitFor(() => {
      expect(screen.getByTestId('personaPrompt')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tab-guardrails'));

    expect(screen.getByTestId('tabPanel')).toHaveTextContent('Guardrails coming soon');
  });
});

describe('unsaved changes across tabs', () => {
  const uploadMock = {
    request: { query: UPLOAD_FILE_TO_KAAPI },
    variableMatcher: () => true,
    result: {
      data: {
        uploadFilesearchFile: {
          fileId: 'file-9',
          filename: 'guide.pdf',
          uploadedAt: '2026-08-04T10:00:00Z',
          fileSize: 2048,
        },
      },
    },
  };

  const editPrompt = async (value = 'Updated instructions') => {
    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('promptInput'), { target: { value } });
  };

  test('dots only the tab that actually changed', async () => {
    renderDetail();
    await editPrompt();

    expect(screen.getByTestId('tabDirtyDot-persona')).toBeInTheDocument();
    expect(screen.queryByTestId('tabDirtyDot-knowledgeBase')).not.toBeInTheDocument();
  });

  test('dots the knowledge base tab when its files change', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), uploadMock]);

    await waitFor(() => {
      expect(screen.getByTestId('tab-knowledgeBase')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));

    const input = screen.getByTestId('fileInput');
    Object.defineProperty(input, 'files', {
      value: [new File(['x'], 'guide.pdf', { type: 'application/pdf' })],
      configurable: true,
    });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByTestId('tabDirtyDot-knowledgeBase')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('tabDirtyDot-persona')).not.toBeInTheDocument();
  });

  test('switching tabs keeps the edit — navigation is never destructive', async () => {
    renderDetail();
    await editPrompt();

    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));
    fireEvent.click(screen.getByTestId('tab-persona'));

    expect(screen.getByTestId('promptInput')).toHaveValue('Updated instructions');
    expect(screen.getByTestId('unsavedChanges')).toBeInTheDocument();
  });

  test('leaving the page with unsaved changes asks first', async () => {
    renderDetail();
    await editPrompt();

    fireEvent.click(screen.getByTestId('back-button'));

    expect(await screen.findByText('Leave without saving?')).toBeInTheDocument();
    expect(screen.queryByTestId('list-page')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Keep editing'));
    await waitFor(() => {
      expect(screen.queryByText('Leave without saving?')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('promptInput')).toHaveValue('Updated instructions');
  });

  test('confirming the prompt leaves the page', async () => {
    renderDetail();
    await editPrompt();

    fireEvent.click(screen.getByTestId('back-button'));
    fireEvent.click(await screen.findByText('Leave'));

    await waitFor(() => {
      expect(screen.getByTestId('list-page')).toBeInTheDocument();
    });
  });

  test('leaves straight away when nothing is unsaved', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('back-button'));

    await waitFor(() => {
      expect(screen.getByTestId('list-page')).toBeInTheDocument();
    });
    expect(screen.queryByText('Leave without saving?')).not.toBeInTheDocument();
  });
});

describe('try it out tab', () => {
  test('opens the sandbox for a saved version', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('tab-tryItOut')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-tryItOut'));

    expect(screen.getByTestId('tryItOut')).toBeInTheDocument();
    expect(screen.getByTestId('testingNote')).toHaveTextContent('Testing Version 1.0');
  });

  test('blocks on unsaved changes, and its Save button saves the page', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'Be concise.' } });
    fireEvent.click(screen.getByTestId('tab-tryItOut'));

    expect(screen.getByTestId('tryItOutBlocker')).toHaveTextContent('Save a version to try it out');
    expect(screen.getByTestId('saveFromTryItOutButton')).toBeInTheDocument();
  });

  test('a brand new assistant is sent to Model & Prompt first', async () => {
    renderDetail('/assistants/add', []);

    await waitFor(() => {
      expect(screen.getByTestId('tab-tryItOut')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-tryItOut'));

    expect(screen.getByTestId('tryItOutBlocker')).toHaveTextContent('Save your first version to try it out');

    fireEvent.click(screen.getByTestId('goToPersonaButton'));
    expect(screen.getByTestId('personaPrompt')).toBeInTheDocument();
  });
});

describe('version status', () => {
  test('a version still building shows In Progress and cannot be published', async () => {
    const building = { ...version(2, false), status: 'in_progress' };
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([version(1, true), building])]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    expect(screen.getByTestId('inProgressPill-2.0')).toHaveTextContent('In Progress');

    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('In Progress');
    });
    expect(screen.getByTestId('liveNote')).toHaveTextContent('This version is still being prepared');
    expect(screen.getByTestId('publishButton')).toBeDisabled();

    fireEvent.mouseOver(screen.getByTestId('publishButton').parentElement as HTMLElement);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('This version is still being prepared');
    });
  });

  test('a failed version says so and cannot be published either', async () => {
    const failed = { ...version(2, false), status: 'failed' };
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([version(1, true), failed])]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Failed');
    });
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Cannot set a failed version as live');
    expect(screen.getByTestId('publishButton')).toBeDisabled();

    fireEvent.mouseOver(screen.getByTestId('publishButton').parentElement as HTMLElement);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Cannot set a failed version as live');
    });
  });

  test('a live version being rebuilt keeps its LIVE badge', async () => {
    const rebuildingLive = { ...version(1, true), status: 'in_progress' };
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([rebuildingLive, version(2, false)])]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('LIVE');
    });
    expect(screen.getByTestId('versionPill')).toHaveTextContent('In Progress');
    // still tells you which version your flows are on
    expect(screen.getByTestId('liveNote')).toHaveTextContent('is live in your flows');
    expect(screen.getByTestId('liveNote')).toHaveTextContent('This version is still being prepared');
  });

  test('a ready draft carries no badge and stays publishable', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock()]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 2.0');
    });
    // a saved draft carries no badge of its own — it is simply not the live one
    expect(screen.getByTestId('versionPill')).not.toHaveTextContent('LIVE');
    expect(screen.getByTestId('publishButton')).not.toBeDisabled();
  });
});

describe('switching versions', () => {
  const liveV1 = { ...version(1, true), prompt: 'You are a helpful assistant.', model: 'gpt-4o' };
  const draftV2 = {
    ...version(2, false),
    prompt: 'Answer in one line.',
    model: 'gpt-4.1',
    settings: { temperature: 0.5 },
  };

  const openVersionMenu = async () => {
    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
  };

  test('loads the selected version prompt, model and temperature', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([liveV1, draftV2])]);

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toHaveValue('You are a helpful assistant.');
    });
    expect(screen.getByTestId('modelSelect')).toHaveTextContent('gpt-4o');
    expect(screen.getByTestId('temperatureInput')).toHaveValue(1);

    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toHaveValue('Answer in one line.');
    });
    expect(screen.getByTestId('modelSelect')).toHaveTextContent('gpt-4.1');
    expect(screen.getByTestId('temperatureInput')).toHaveValue(0.5);
    // loading a version is not an edit
    expect(screen.queryByTestId('unsavedChanges')).not.toBeInTheDocument();
  });

  test('parses settings that arrive as a JSON string', async () => {
    const stringSettings = { ...draftV2, settings: JSON.stringify({ temperature: 0.7 }) };
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([liveV1, stringSettings])]);

    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    await waitFor(() => {
      expect(screen.getByTestId('temperatureInput')).toHaveValue(0.7);
    });
  });

  test('asks before throwing away unsaved edits, and keeps them on cancel', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([liveV1, draftV2])]);

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'My own words' } });

    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    expect(await screen.findByText('Switch version?')).toBeInTheDocument();
    expect(screen.getByTestId('promptInput')).toHaveValue('My own words');

    fireEvent.click(screen.getByText('Keep editing'));
    await waitFor(() => {
      expect(screen.queryByText('Switch version?')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('promptInput')).toHaveValue('My own words');
    expect(screen.getByTestId('unsavedChanges')).toBeInTheDocument();
  });

  test('confirming the switch loads the other version', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([liveV1, draftV2])]);

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'My own words' } });

    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2.0'));
    fireEvent.click(await screen.findByText('Switch version'));

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toHaveValue('Answer in one line.');
    });
    expect(screen.queryByTestId('unsavedChanges')).not.toBeInTheDocument();
  });

  test('the knowledge base follows the selected version', async () => {
    const versionWithStore = {
      ...draftV2,
      vectorStore: {
        id: 'vs-2',
        vectorStoreId: 'vs_two',
        knowledgeBaseVersionId: 'kbv-2',
        name: 'kb-2',
        legacy: false,
        size: 1,
        files: [{ id: 'file-2', name: 'older_policy.pdf', fileSize: 2048 }],
      },
    };
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([liveV1, versionWithStore])]);

    await waitFor(() => {
      expect(screen.getByTestId('tab-knowledgeBase')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));

    expect(screen.getByTestId('knowledgeBaseFile')).toHaveTextContent('Accelerator Guide (1).pdf');

    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    await waitFor(() => {
      expect(screen.getByTestId('knowledgeBaseFile')).toHaveTextContent('older_policy.pdf');
    });
    expect(screen.queryByTestId('unsavedChanges')).not.toBeInTheDocument();
  });

  const storeFor = (overrides: Record<string, unknown> = {}) => ({
    id: 'vs-2',
    vectorStoreId: 'vs_two',
    knowledgeBaseVersionId: 'kbv-2',
    name: 'kb-2',
    legacy: false,
    size: 2048,
    files: [{ id: 'file-2', name: 'older_policy.pdf', fileSize: 2048 }],
    ...overrides,
  });

  const openKnowledgeBaseFor = async (versionTwo: Record<string, unknown>) => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([liveV1, versionTwo as any])]);
    await waitFor(() => {
      expect(screen.getByTestId('tab-knowledgeBase')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));
    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2.0'));
  };

  test('a version with an empty store shows nothing attached, not the previous files', async () => {
    await openKnowledgeBaseFor({ ...draftV2, vectorStore: storeFor({ files: [] }) });

    await waitFor(() => {
      expect(screen.getByTestId('knowledgeBaseEmpty')).toBeInTheDocument();
    });
    expect(screen.getByTestId('fileCount')).toHaveTextContent('0 files attached');
    expect(screen.queryByText('Accelerator Guide (1).pdf')).not.toBeInTheDocument();
  });

  test('a version with no store at all reports that in technical details', async () => {
    await openKnowledgeBaseFor({ ...draftV2, vectorStore: null });

    await waitFor(() => {
      expect(screen.getByTestId('knowledgeBaseEmpty')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('technicalDetailsToggle'));
    expect(screen.getByTestId('noVectorStore')).toBeInTheDocument();
  });

  test('technical details show the selected version store, not the assistant one', async () => {
    await openKnowledgeBaseFor({ ...draftV2, vectorStore: storeFor() });

    await waitFor(() => {
      expect(screen.getByTestId('knowledgeBaseFile')).toHaveTextContent('older_policy.pdf');
    });
    fireEvent.click(screen.getByTestId('technicalDetailsToggle'));
    expect(screen.getByTestId('vectorStoreId')).toHaveTextContent('vs_two');
    expect(screen.getByTestId('vectorStoreId')).not.toHaveTextContent('vs_abc123');
  });

  test('a legacy store makes that version read-only', async () => {
    await openKnowledgeBaseFor({ ...draftV2, vectorStore: storeFor({ legacy: true }) });

    await waitFor(() => {
      expect(screen.getByTestId('legacyNotice')).toBeInTheDocument();
    });
    expect(screen.getByTestId('addFilesButton')).toBeDisabled();
    expect(screen.queryByTestId('removeFileButton')).not.toBeInTheDocument();
  });

  test('saving rebuilds on the selected version store, not the live one', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    const versionTwo = { ...draftV2, vectorStore: storeFor() };
    const createKnowledgeBaseMock = {
      request: {
        query: CREATE_KNOWLEDGE_BASE,
        // vs-2 is the store attached to version 2 — vs-1 belongs to the live version
        variables: { createKnowledgeBaseId: 'vs-2', mediaInfo: [] },
      },
      result: {
        data: { createKnowledgeBase: { knowledgeBase: { id: 'kb-2', knowledgeBaseVersionId: 'kbv-9', name: 'kb' } } },
      },
    };
    const saveMock = {
      request: {
        query: UPDATE_ASSISTANT,
        variables: {
          updateAssistantId: '1',
          input: {
            instructions: 'Answer in one line.',
            model: 'gpt-4.1',
            temperature: 0.5,
            knowledgeBaseVersionId: 'kbv-9',
            name: 'Assistant-405db438',
          },
        },
      },
      result: { data: { updateAssistant: { errors: null } } },
    };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock([liveV1, versionTwo as any]),
      createKnowledgeBaseMock,
      saveMock,
      getAssistant('1'),
      versionsMock([liveV1, versionTwo as any]),
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('tab-knowledgeBase')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));
    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    await waitFor(() => {
      expect(screen.getByTestId('knowledgeBaseFile')).toHaveTextContent('older_policy.pdf');
    });
    fireEvent.click(screen.getByTestId('removeFileButton'));
    fireEvent.click(await screen.findByText('Remove file'));
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Changes saved successfully');
    });
    notificationSpy.mockRestore();
  });

  test('an upload landing after a version switch appends to the new list', async () => {
    // the upload must not settle until the switch has happened, and a wall-clock delay loses
    // that race whenever the suite runs slowly — so the clock is held still instead
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const slowUpload = {
      request: { query: UPLOAD_FILE_TO_KAAPI },
      variableMatcher: () => true,
      delay: 5_000,
      result: {
        data: {
          uploadFilesearchFile: {
            fileId: 'file-9',
            filename: 'guide.pdf',
            uploadedAt: '2026-08-04T10:00:00Z',
            fileSize: 2048,
          },
        },
      },
    };
    const versionTwo = { ...draftV2, vectorStore: storeFor() };
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([liveV1, versionTwo as any]), slowUpload]);

    await waitFor(() => {
      expect(screen.getByTestId('tab-knowledgeBase')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));

    const input = screen.getByTestId('fileInput');
    Object.defineProperty(input, 'files', {
      value: [new File(['x'], 'guide.pdf', { type: 'application/pdf' })],
      configurable: true,
    });
    fireEvent.change(input);

    // switch versions while the upload is still going
    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    // the switch lands first: nothing has changed yet, so there is nothing to confirm
    await waitFor(() => {
      expect(screen.getByTestId('knowledgeBase')).toHaveTextContent('older_policy.pdf');
    });

    await act(async () => void (await vi.advanceTimersByTimeAsync(5_000)));

    await waitFor(() => {
      expect(screen.getAllByTestId('knowledgeBaseFile')).toHaveLength(2);
    });
    // appended to version 2's files, not to the list captured when the upload started
    expect(screen.getByTestId('knowledgeBase')).toHaveTextContent('older_policy.pdf');
    expect(screen.getByTestId('knowledgeBase')).toHaveTextContent('guide.pdf');
    expect(screen.queryByText('Accelerator Guide (1).pdf')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  test('a save moves the selection onto the version it just created', async () => {
    const saveMock = {
      request: {
        query: UPDATE_ASSISTANT,
        variables: {
          updateAssistantId: '1',
          input: {
            instructions: 'Be concise.',
            model: 'gpt-4o',
            temperature: 1,
            name: 'Assistant-405db438',
          },
        },
      },
      result: { data: { updateAssistant: { errors: null } } },
    };
    const savedV3 = { ...version(3, false), prompt: 'Be concise.', model: 'gpt-4o' };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock([liveV1, draftV2]),
      saveMock,
      getAssistant('1'),
      versionsMock([liveV1, draftV2, savedV3]),
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'Be concise.' } });
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    // the pill follows the new version instead of staying on the live one
    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 3.0');
    });
    expect(screen.getByTestId('promptInput')).toHaveValue('Be concise.');
  });
});

describe('what a save sends', () => {
  const captureSave = () => {
    const sent: { variables?: any } = {};
    return {
      sent,
      mock: {
        request: { query: UPDATE_ASSISTANT },
        variableMatcher: (variables: any) => {
          if (variables.input?.name && Object.keys(variables.input).length === 1) return false;
          sent.variables = variables;
          return true;
        },
        result: { data: { updateAssistant: { errors: null } } },
      },
    };
  };

  test('a reasoning model sends its effort and no temperature', async () => {
    const { sent, mock } = captureSave();
    const reasoning = { ...version(1, true), model: 'gpt-5', settings: { effort: 'medium' } as any };
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([reasoning]), mock]);

    await waitFor(() => {
      expect(screen.getByTestId('effortSegment')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('effortSegment-high'));
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(sent.variables).toBeDefined();
    });
    expect(sent.variables.input.effort).toBe('high');
    // gpt-5 declares no temperature, so sending one would be rejected
    expect(sent.variables.input).not.toHaveProperty('temperature');
  });

  test('a standard model sends its temperature and no effort', async () => {
    const { sent, mock } = captureSave();
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([version(1, true)]), mock]);

    await waitFor(() => {
      expect(screen.getByTestId('temperatureInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('temperatureInput'), { target: { value: '0.5' } });
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(sent.variables).toBeDefined();
    });
    expect(sent.variables.input.temperature).toBe(0.5);
    expect(sent.variables.input).not.toHaveProperty('effort');
  });
});

test('an assistant with no versions shows the effort it was saved with', async () => {
  const reasoningAssistant = {
    ...getAssistant('1', { model: 'gpt-5' }),
    result: {
      data: {
        assistant: {
          ...getAssistant('1').result.data.assistant,
          assistant: {
            ...getAssistant('1', { model: 'gpt-5' }).result.data.assistant.assistant,
            effort: 'high',
          },
        },
      },
    },
  };
  renderDetail('/assistants/1', [reasoningAssistant, versionsMock([])]);

  const high = await screen.findByTestId('effortSegment-high');
  expect(high).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByTestId('effortSegment-low')).toHaveAttribute('aria-checked', 'false');
});

describe('resilience', () => {
  test('a version whose settings will not parse still loads', async () => {
    const broken = { ...version(1, true), settings: 'not json' };
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock([broken])]);

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    // the prompt still comes through; only the unreadable settings fall back to defaults
    expect(screen.getByTestId('promptInput')).toHaveValue('You are a helpful assistant.');
  });

  test('reselecting the version already on screen does nothing', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(screen.getByTestId('versionOption-1.0'));

    // version 1 is already selected, so there is nothing to confirm or reload
    expect(screen.queryByText('Switch version?')).not.toBeInTheDocument();
    expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 1.0');
  });

  test('a publish that throws is reported', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const failingPublish = {
      request: { query: SET_LIVE_VERSION, variables: { assistantId: '1', versionId: 'v2' } },
      error: new Error('Network down'),
    };
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), failingPublish]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(screen.getByTestId('versionOption-2.0'));

    fireEvent.click(await screen.findByTestId('publishButton'));
    await confirmPublish();

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    errorSpy.mockRestore();
  });

  test('leaving with unsaved changes warns the browser too', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'Be concise.' } });

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);

    // a cancelled beforeunload is what makes the browser show its confirm dialog
    expect(event.defaultPrevented).toBe(true);
  });
});

test('a reply that lands while another tab is open is not lost', async () => {
  const sendMock = {
    request: { query: SEND_ASSISTANT_MESSAGE },
    variableMatcher: () => true,
    result: {
      data: {
        sendAssistantMessage: { answer: null, conversationId: 'c1', jobId: 'j1', requestId: 'r1', errors: null },
      },
    },
  };
  const replyMock = {
    request: { query: ASSISTANT_CHAT_RESPONSE },
    result: {
      data: {
        assistantChatResponse: {
          answer: 'Here you go',
          conversationId: 'c1',
          jobId: 'j1',
          requestId: 'r1',
          errors: null,
        },
      },
    },
    delay: 150,
  };
  renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), sendMock, replyMock]);

  await waitFor(() => {
    expect(screen.getByTestId('versionPill')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('tab-tryItOut'));
  fireEvent.change(await screen.findByTestId('sandboxInput'), { target: { value: 'Hello' } });
  fireEvent.click(screen.getByTestId('sendMessageButton'));
  await screen.findByTestId('pendingMessage');

  // walk away while the answer is still in flight
  fireEvent.click(screen.getByTestId('tab-persona'));
  expect(screen.getByTestId('tabPanel-tryItOut')).toHaveAttribute('hidden');

  fireEvent.click(screen.getByTestId('tab-tryItOut'));

  expect(await screen.findByTestId('assistantMessage')).toHaveTextContent('Here you go');
});

test('the settings panel does not flip from Temperature to Reasoning effort while loading', async () => {
  // the assistant record still names an older temperature model; its newest version is on gpt-5
  renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), getAssistant('1'), versionsMock()]);

  await waitFor(() => {
    expect(screen.getByTestId('personaPrompt')).toBeInTheDocument();
  });

  // whatever shows first is what stays — no swap once the queries have all landed
  const shownFirst = screen.queryByTestId('temperatureSlider') ? 'temperature' : 'effort';

  await waitFor(() => {
    expect(screen.getByTestId('modelParams')).toBeInTheDocument();
  });

  expect(screen.queryByTestId('temperatureSlider') ? 'temperature' : 'effort').toBe(shownFirst);
});

describe('a prompt improvement finishing in the background', () => {
  const improvedMock = (improvePromptUpdated: any) => ({
    request: { query: IMPROVE_PROMPT_UPDATED },
    result: { data: { improvePromptUpdated } },
  });

  test('the version it wrote is selected without the reader reloading', async () => {
    const notify = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      // the improved prompt lands as version 3, which the refetch then returns
      versionsMock([version(1, true), version(2, false), version(3, false)]),
      improvedMock({ status: 'completed', error: null, configVersion: version(3, false) }),
    ]);

    await waitFor(() => expect(notify).toHaveBeenCalledWith('A new version with the improved prompt is ready'));

    notify.mockRestore();
  });

  test('a version belonging to another assistant is ignored, not jumped to', async () => {
    const notify = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      versionsMock(),
      // the topic is org-wide, so this can be someone else's run entirely
      improvedMock({ status: 'completed', error: null, configVersion: { ...version(9, false), id: 'v-elsewhere' } }),
    ]);

    await screen.findByTestId('assistantDetailContainer');
    await waitFor(() => expect(notify).not.toHaveBeenCalledWith('A new version with the improved prompt is ready'));

    notify.mockRestore();
  });

  test('a failed improvement says why rather than going quiet', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      improvedMock({ status: 'failed', error: 'The model refused the rewrite', configVersion: null }),
    ]);

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith('The model refused the rewrite', 'The prompt could not be improved')
    );

    errorSpy.mockRestore();
  });

  test('an update carrying neither a version nor an error changes nothing', async () => {
    const notify = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      improvedMock({ status: 'processing', error: null, configVersion: null }),
    ]);

    await screen.findByTestId('assistantDetailContainer');
    expect(notify).not.toHaveBeenCalledWith('A new version with the improved prompt is ready');
    expect(errorSpy).not.toHaveBeenCalled();

    notify.mockRestore();
    errorSpy.mockRestore();
  });
});

describe('a version changing while the page is open', () => {
  const configUpdate = (assistantConfigVersionUpdated: any) => ({
    request: { query: ASSISTANT_CONFIG_VERSION_UPDATED },
    result: { data: { assistantConfigVersionUpdated } },
  });

  const knowledgeBaseUpdate = (knowledgeBaseVersionUpdated: any) => ({
    request: { query: KNOWLEDGE_BASE_VERSION_UPDATED },
    result: { data: { knowledgeBaseVersionUpdated } },
  });

  test('a build finishing clears In Progress without a reload', async () => {
    const building = { ...version(2, false), status: 'in_progress' };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock([version(1, true), building]),
      configUpdate({ ...building, status: 'ready' }),
    ]);

    fireEvent.click(await screen.findByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2.0'));

    // the pill goes as the build lands, and the version becomes publishable
    await waitFor(() => {
      expect(screen.queryByTestId('inProgressPill-2.0')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('publishButton')).toBeEnabled();
  });

  test('a version built after the page loaded is fetched, and brings its knowledge base with it', async () => {
    const fresh = {
      ...version(3, false),
      vectorStore: {
        id: 'vs-3',
        vectorStoreId: 'vs_built_later',
        knowledgeBaseVersionId: 'llm-vs-3',
        name: 'VectorStore-new',
        legacy: false,
        size: 100,
        files: [],
      },
    };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock([version(1, true)]),
      configUpdate(fresh),
      versionsMock([version(1, true), fresh]),
    ]);

    fireEvent.click(await screen.findByTestId('versionPill'));
    await waitFor(() => {
      expect(screen.getByTestId('versionOption-3.0')).toBeInTheDocument();
    });
  });

  test('the knowledge base id lands with the build, without a reload', async () => {
    const building = { ...version(2, false), status: 'in_progress', vectorStore: null };

    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock([version(1, true), building]),
      configUpdate({
        ...building,
        status: 'ready',
        vectorStore: {
          id: 'vs-2',
          vectorStoreId: 'vs_freshly_made',
          knowledgeBaseVersionId: 'llm-vs-2',
          name: 'VectorStore-new',
          legacy: false,
          size: 100,
          files: [],
        },
      }),
    ]);

    fireEvent.click(await screen.findByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2.0'));
    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));
    fireEvent.click(await screen.findByTestId('technicalDetailsToggle'));

    await waitFor(() => {
      expect(screen.getByTestId('vectorStoreId')).toHaveTextContent('vs_freshly_made');
    });
  });

  test('a version going live elsewhere moves the LIVE badge over', async () => {
    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      configUpdate({ ...version(2, false), isLive: true }),
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('liveNote')).toHaveTextContent('Version 2.0 is live in your flows');
    });

    // the badge belongs to one version at a time
    fireEvent.click(screen.getByTestId('versionPill'));
    expect(screen.getByTestId('versionOption-2.0')).toHaveTextContent('LIVE');
    expect(screen.getByTestId('versionOption-1.0')).not.toHaveTextContent('LIVE');
  });

  test('an update that leaves the label out keeps the number on screen', async () => {
    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      // the server derives versionLabel when it lists versions, so a pushed one arrives without it
      configUpdate({ ...version(2, false), versionLabel: null, status: 'ready' }),
    ]);

    fireEvent.click(await screen.findByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2.0'));

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 2.0');
    });
  });

  test('an update that carries no version at all changes nothing', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), configUpdate(null)]);

    fireEvent.click(await screen.findByTestId('versionPill'));
    expect(screen.getByTestId('versionOption-2.0')).toBeInTheDocument();
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Version 1.0 is live in your flows');
  });

  test('a version update landing before the list does is left to the list', async () => {
    // nothing is cached yet, so there is no list to merge into and none to refetch either
    renderDetail('/assistants/1', [getAssistant('1'), configUpdate(version(2, false))]);

    await screen.findByTestId('assistantDetailContainer');
    expect(screen.queryByTestId('versionPill')).not.toBeInTheDocument();
  });

  test('a knowledge base update that carries nothing is ignored', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), knowledgeBaseUpdate(null)]);

    await screen.findByTestId('assistantDetailContainer');
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Version 1.0 is live in your flows');
  });

  test('a knowledge base update landing before the versions do is ignored', async () => {
    // nothing is in the cache yet, so there is no version to match the update against
    renderDetail('/assistants/1', [getAssistant('1'), knowledgeBaseUpdate({ id: 'llm-vs-1', status: 'completed' })]);

    await screen.findByTestId('assistantDetailContainer');
    expect(screen.queryByTestId('versionPill')).not.toBeInTheDocument();
  });

  test('the version dropdown carries how each version scored last time', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), ...runMocks({ v1: 4.32, v2: 2.4 })]);

    fireEvent.click(await screen.findByTestId('versionPill'));

    await waitFor(() => {
      expect(screen.getByTestId('versionHealth-1.0')).toHaveTextContent('Good 4.32');
    });
    expect(screen.getByTestId('versionHealth-2.0')).toHaveTextContent('Could improve 2.4');

    // the same marks the list and the run panel use, so a score reads the same everywhere
    expect(screen.getByTestId('versionHealth-1.0').querySelector('svg')).toHaveAttribute('data-testid', 'CheckIcon');
    expect(screen.getByTestId('versionHealth-2.0').querySelector('svg')).toHaveAttribute(
      'data-testid',
      'WarningAmberIcon'
    );
  });

  test('a version never evaluated carries no score', async () => {
    renderDetail('/assistants/1', [getAssistant('1'), versionsMock(), ...runMocks({ v1: 4.32 })]);

    fireEvent.click(await screen.findByTestId('versionPill'));

    await waitFor(() => {
      expect(screen.getByTestId('versionHealth-1.0')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('versionHealth-2.0')).not.toBeInTheDocument();
  });

  test('a version from another assistant is left alone', async () => {
    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      // org-wide topic, so this is someone else's assistant
      configUpdate({ ...version(2, false), id: 'v-elsewhere', status: 'failed' }),
    ]);

    fireEvent.click(await screen.findByTestId('versionPill'));
    await waitFor(() => {
      expect(screen.getByTestId('versionOption-2.0')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('failedPill-2.0')).not.toBeInTheDocument();
  });

  test('the knowledge base finishing indexing reloads the versions', async () => {
    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      knowledgeBaseUpdate({
        id: 'llm-vs-1',
        knowledgeBaseId: 'kb-1',
        versionNumber: 1,
        status: 'completed',
        size: 4096,
        insertedAt: '2024-10-16T15:00:00Z',
        updatedAt: '2024-10-16T15:05:00Z',
      }),
      // version 1 carries knowledge base version llm-vs-1, so the page asks for the versions again
      versionsMock([version(1, true), version(2, false), version(3, false)]),
    ]);

    fireEvent.click(await screen.findByTestId('versionPill'));

    await waitFor(() => {
      expect(screen.getByTestId('versionOption-3.0')).toBeInTheDocument();
    });
  });

  test('a knowledge base this assistant does not use is ignored', async () => {
    renderDetail('/assistants/1', [
      getAssistant('1'),
      versionsMock(),
      knowledgeBaseUpdate({
        id: 'llm-vs-elsewhere',
        knowledgeBaseId: 'kb-9',
        versionNumber: 3,
        status: 'completed',
        size: 100,
        insertedAt: '2024-10-16T15:00:00Z',
        updatedAt: '2024-10-16T15:05:00Z',
      }),
      // a refetch would pick this up and show a third version — nothing should reach for it
      versionsMock([version(1, true), version(2, false), version(3, false)]),
    ]);

    fireEvent.click(await screen.findByTestId('versionPill'));
    await waitFor(() => {
      expect(screen.getByTestId('versionOption-2.0')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('versionOption-3.0')).not.toBeInTheDocument();
  });
});
