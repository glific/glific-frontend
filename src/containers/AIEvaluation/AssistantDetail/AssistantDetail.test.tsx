import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import * as Notification from 'common/notification';
import * as Utils from 'common/utils';
import {
  CREATE_ASSISTANT,
  CREATE_KNOWLEDGE_BASE,
  SET_LIVE_VERSION,
  UPDATE_ASSISTANT,
  UPLOAD_FILE_TO_KAAPI,
} from 'graphql/mutations/Assistant';
import { GET_ASSISTANT, GET_ASSISTANT_VERSIONS, GET_KAAPI_MODELS } from 'graphql/queries/Assistant';
import type { AssistantVersion } from 'containers/AIEvaluation/types/assistantType';
import { getAssistant } from 'mocks/Assistants';
import { rawModels } from './Tabs/PersonaPrompt/PersonaPrompt.test';
import AssistantDetail from './AssistantDetail';

const version = (versionNumber: number, isLive: boolean) => ({
  id: `v${versionNumber}`,
  versionNumber,
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

const versionsMock = (assistantVersions = [version(1, true), version(2, false)]) => ({
  request: { query: GET_ASSISTANT_VERSIONS, variables: { assistantId: '1' } },
  result: { data: { assistantVersions } },
});

const defaultMocks = () => [getAssistant('1'), versionsMock()];

// every render loads the model list, so the mock rides along with whatever else a test needs
const kaapiModelsMock = {
  request: { query: GET_KAAPI_MODELS },
  result: { data: { kaapiModels: rawModels } },
  maxUsageCount: Number.POSITIVE_INFINITY,
};

const renderDetail = (path = '/ai-evaluation-v2/1', mocks: any[] = defaultMocks()) =>
  render(
    <MockedProvider mocks={[...mocks, kaapiModelsMock]}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/ai-evaluation-v2" element={<div data-testid="list-page" />} />
          <Route path="/ai-evaluation-v2/:assistantId" element={<AssistantDetail />} />
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
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Version 1 is live in your flows');
    expect(screen.getByTestId('publishButton')).toBeInTheDocument();
    // version 1 is live and selected by default, so there is nothing to publish
    expect(screen.getByTestId('publishButton')).toBeDisabled();
  });

  test('publishing a draft version calls setLiveVersion and refetches the versions', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
    const publishMock = {
      request: { query: SET_LIVE_VERSION, variables: { assistantId: '1', versionId: 'v2' } },
      result: {
        data: {
          setLiveVersion: {
            assistant: { id: '1', activeConfigVersionId: 'v2', liveVersionNumber: 2 },
            errors: null,
          },
        },
      },
    };

    renderDetail('/ai-evaluation-v2/1', [
      getAssistant('1'),
      versionsMock(),
      publishMock,
      // the refetch that follows a successful publish
      versionsMock([version(1, false), version(2, true)]),
    ]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2'));

    await waitFor(() => {
      expect(screen.getByTestId('publishButton')).toBeEnabled();
    });
    fireEvent.click(screen.getByTestId('publishButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Version published — it is now live in your flows');
    });
    notificationSpy.mockRestore();
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

    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock(), failingPublish, versionsMock()]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(await screen.findByTestId('versionOption-2'));
    fireEvent.click(screen.getByTestId('publishButton'));

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

    // with no versions the editor falls back to the assistant record
    renderDetail('/ai-evaluation-v2/1', [sparse, versionsMock([])]);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('gpt-4.1');
    });
    expect(screen.getByTestId('temperatureInput')).toHaveValue(1);

    fireEvent.click(screen.getByTestId('editNameButton'));
    expect(screen.getByTestId('nameInput')).toHaveValue('');
  });

  test('version rows fall back to insertedAt, and drop the timestamp when both are missing', async () => {
    const noUpdatedAt = { ...version(1, true), updatedAt: null };
    const noDates = { ...version(2, false), updatedAt: null, insertedAt: null, description: 'Draft config' };

    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([noUpdatedAt, noDates])]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));

    expect(await screen.findByTestId('versionOption-1')).toHaveTextContent(/published .*ago/);
    expect(screen.getByTestId('versionOption-2')).toHaveTextContent('Draft config');
    expect(screen.getByTestId('versionOption-2')).not.toHaveTextContent('ago');
  });

  test('shows a not-found message when the query errors', async () => {
    const errorMock = {
      request: { query: GET_ASSISTANT, variables: { assistantId: '1' } },
      error: new Error('Network error'),
    };
    renderDetail('/ai-evaluation-v2/1', [errorMock, versionsMock()]);

    await waitFor(() => {
      expect(screen.getByTestId('assistantNotFound')).toBeInTheDocument();
    });
  });

  test('shows a not-found message when the assistant is missing', async () => {
    const emptyMock = {
      request: { query: GET_ASSISTANT, variables: { assistantId: '1' } },
      result: { data: { assistant: { __typename: 'AssistantResult', assistant: null } } },
    };
    renderDetail('/ai-evaluation-v2/1', [emptyMock, versionsMock()]);

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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock(), updateMock, renamedAssistantMock]);
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

    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock(), failingRename]);
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

    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock(), networkError]);
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

    renderDetail('/ai-evaluation-v2/1', [
      getAssistant('1'),
      versionsMock(),
      saveMock,
      getAssistant('1'),
      versionsMock(),
    ]);
    await edit();

    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(screen.queryByTestId('unsavedChanges')).not.toBeInTheDocument();
    });
  });

  test('renaming a new assistant opens prefilled with the placeholder name', async () => {
    renderDetail('/ai-evaluation-v2/add', []);

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

    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock(), failingSave]);
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

    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock(), networkError]);
    await edit();
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    errorSpy.mockRestore();
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

    renderDetail('/ai-evaluation-v2/1', [
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
          input: { instructions: 'Hello', model: 'gpt-4.1', temperature: 1, name: 'Untitled assistant' },
        },
      },
      result: { data: { createAssistant: { assistant: { id: '7', name: 'Untitled assistant' }, errors: null } } },
    };

    renderDetail('/ai-evaluation-v2/add', [createMock]);
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
          input: { instructions: 'Hello', model: 'gpt-4.1', temperature: 1, name: 'Untitled assistant' },
        },
      },
      result: { data: { createAssistant: { assistant: null, errors: [{ message: 'Name taken', key: 'name' }] } } },
    };

    renderDetail('/ai-evaluation-v2/add', [failingCreate]);
    await edit('Hello');
    fireEvent.click(screen.getByTestId('saveVersionButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith({ message: 'Name taken', key: 'name' });
    });
    expect(screen.getByTestId('unsavedChanges')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  test('create mode starts clean and shows no publish button', async () => {
    renderDetail('/ai-evaluation-v2/add', []);

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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock(), uploadMock]);
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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock(), slowUpload]);

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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock(), uploadMock]);
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

    renderDetail('/ai-evaluation-v2/1', [
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
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 1');
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
      expect.stringContaining('Version 2'),
      expect.stringContaining('Version 1'),
    ]);
    expect(
      screen.getByText('Saving creates a minor version. Publishing promotes it to the next major and makes it live.')
    ).toBeInTheDocument();

    // the draft reads "saved <ago>", the published one "published <ago>"
    expect(options[0]).toHaveTextContent(/Not published.*saved .*ago/);
    expect(options[1]).toHaveTextContent(/LIVE.*published .*ago/);

    fireEvent.click(screen.getByTestId('versionOption-2'));

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 2');
    });
    expect(screen.getByTestId('versionPill')).toHaveTextContent('Not published');
    // the live note keeps pointing at the published version, not the selected one
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Version 1 is live in your flows');
  });

  test('falls back to the latest version when nothing is published', async () => {
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([version(1, false), version(2, false)])]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 2');
    });
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Nothing published yet');
  });

  test('shows a placeholder when the assistant has no versions yet', async () => {
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([])]);

    await waitFor(() => {
      expect(screen.getByTestId('noVersionPill')).toHaveTextContent('No version saved yet');
    });
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Nothing published yet');
    expect(screen.queryByTestId('versionPill')).not.toBeInTheDocument();
    // an existing assistant is not "new", however few versions it has
    expect(screen.queryByTestId('newAssistantPill')).not.toBeInTheDocument();
  });
});

describe('create mode', () => {
  test('renders an empty shell with nothing prefilled', async () => {
    renderDetail('/ai-evaluation-v2/add', []);

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
  test('opens on Persona & Prompt and switches panels on click', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('personaPrompt')).toBeInTheDocument();
    });
    expect(screen.getByTestId('tab-persona')).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByTestId('tab-evaluation'));

    expect(screen.getByTestId('tabPanel')).toHaveTextContent('Golden Q&A Evaluation coming soon');
    expect(screen.getByTestId('tab-evaluation')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('tab-persona')).toHaveAttribute('aria-selected', 'false');
  });

  test('renders every tab, with the sandbox badge on Try It Out', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByTestId('tab-persona')).toBeInTheDocument();
    });

    ['persona', 'knowledgeBase', 'guardrails', 'evaluation', 'tryItOut'].forEach((key) => {
      expect(screen.getByTestId(`tab-${key}`)).toBeInTheDocument();
    });
    expect(screen.getByTestId('tab-tryItOut')).toHaveTextContent('SANDBOX');
  });

  test('tabs keep working in create mode', async () => {
    renderDetail('/ai-evaluation-v2/add', []);

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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock(), uploadMock]);

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

describe('version status', () => {
  test('a version still building shows In Progress and cannot be published', async () => {
    const building = { ...version(2, false), status: 'in_progress' };
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([version(1, true), building])]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    expect(screen.getByTestId('inProgressPill-2')).toHaveTextContent('In Progress');
    expect(screen.getByTestId('versionOption-2')).toHaveTextContent('Not published');

    fireEvent.click(screen.getByTestId('versionOption-2'));

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('In Progress');
    });
    expect(screen.getByTestId('versionPill')).toHaveTextContent('Not published');
    expect(screen.getByTestId('liveNote')).toHaveTextContent('This version is still being prepared');
    expect(screen.getByTestId('publishButton')).toBeDisabled();
  });

  test('a failed version says so and cannot be published either', async () => {
    const failed = { ...version(2, false), status: 'failed' };
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([version(1, true), failed])]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(screen.getByTestId('versionOption-2'));

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Failed');
    });
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Cannot set a failed version as live');
    expect(screen.getByTestId('publishButton')).toBeDisabled();
  });

  test('a live version being rebuilt keeps its LIVE badge', async () => {
    const rebuildingLive = { ...version(1, true), status: 'in_progress' };
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([rebuildingLive, version(2, false)])]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('LIVE');
    });
    expect(screen.getByTestId('versionPill')).toHaveTextContent('In Progress');
    // still tells you which version your flows are on
    expect(screen.getByTestId('liveNote')).toHaveTextContent('is live in your flows');
    expect(screen.getByTestId('liveNote')).toHaveTextContent('This version is still being prepared');
  });

  test('a ready draft still shows not published and stays publishable', async () => {
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock()]);

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('versionPill'));
    fireEvent.click(screen.getByTestId('versionOption-2'));

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Not published');
    });
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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([liveV1, draftV2])]);

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toHaveValue('You are a helpful assistant.');
    });
    expect(screen.getByRole('combobox')).toHaveTextContent('gpt-4o');
    expect(screen.getByTestId('temperatureInput')).toHaveValue(1);

    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2'));

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toHaveValue('Answer in one line.');
    });
    expect(screen.getByRole('combobox')).toHaveTextContent('gpt-4.1');
    expect(screen.getByTestId('temperatureInput')).toHaveValue(0.5);
    // loading a version is not an edit
    expect(screen.queryByTestId('unsavedChanges')).not.toBeInTheDocument();
  });

  test('parses settings that arrive as a JSON string', async () => {
    const stringSettings = { ...draftV2, settings: JSON.stringify({ temperature: 0.7 }) };
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([liveV1, stringSettings])]);

    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2'));

    await waitFor(() => {
      expect(screen.getByTestId('temperatureInput')).toHaveValue(0.7);
    });
  });

  test('asks before throwing away unsaved edits, and keeps them on cancel', async () => {
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([liveV1, draftV2])]);

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'My own words' } });

    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2'));

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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([liveV1, draftV2])]);

    await waitFor(() => {
      expect(screen.getByTestId('promptInput')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByTestId('promptInput'), { target: { value: 'My own words' } });

    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2'));
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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([liveV1, versionWithStore])]);

    await waitFor(() => {
      expect(screen.getByTestId('tab-knowledgeBase')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));

    expect(screen.getByTestId('knowledgeBaseFile')).toHaveTextContent('Accelerator Guide (1).pdf');

    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2'));

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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([liveV1, versionTwo as any])]);
    await waitFor(() => {
      expect(screen.getByTestId('tab-knowledgeBase')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-knowledgeBase'));
    await openVersionMenu();
    fireEvent.click(screen.getByTestId('versionOption-2'));
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

    renderDetail('/ai-evaluation-v2/1', [
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
    fireEvent.click(screen.getByTestId('versionOption-2'));

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
    const slowUpload = {
      request: { query: UPLOAD_FILE_TO_KAAPI },
      variableMatcher: () => true,
      delay: 60,
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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([liveV1, versionTwo as any]), slowUpload]);

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
    fireEvent.click(screen.getByTestId('versionOption-2'));

    await waitFor(() => {
      expect(screen.getAllByTestId('knowledgeBaseFile')).toHaveLength(2);
    });
    // appended to version 2's files, not to the list captured when the upload started
    expect(screen.getByTestId('knowledgeBase')).toHaveTextContent('older_policy.pdf');
    expect(screen.getByTestId('knowledgeBase')).toHaveTextContent('guide.pdf');
    expect(screen.queryByText('Accelerator Guide (1).pdf')).not.toBeInTheDocument();
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

    renderDetail('/ai-evaluation-v2/1', [
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
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 3');
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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([reasoning]), mock]);

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
    renderDetail('/ai-evaluation-v2/1', [getAssistant('1'), versionsMock([version(1, true)]), mock]);

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
  renderDetail('/ai-evaluation-v2/1', [reasoningAssistant, versionsMock([])]);

  const high = await screen.findByTestId('effortSegment-high');
  expect(high).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByTestId('effortSegment-low')).toHaveAttribute('aria-checked', 'false');
});
