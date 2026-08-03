import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import * as Utils from 'common/utils';
import { UPDATE_ASSISTANT } from 'graphql/mutations/Assistant';
import { GET_ASSISTANT, GET_ASSISTANT_VERSIONS } from 'graphql/queries/Assistant';
import { getAssistant } from 'mocks/Assistants';

import AssistantDetail from './AssistantDetail';

const version = (versionNumber: number, isLive: boolean) => ({
  id: `v${versionNumber}`,
  versionNumber,
  model: 'gpt-4o',
  prompt: 'You are a helpful assistant.',
  settings: { temperature: 1 },
  status: 'ready',
  isLive,
  description: null,
  insertedAt: '2024-10-16T15:00:00Z',
  updatedAt: '2024-10-16T15:00:00Z',
  vectorStore: null,
});

// version 2 is the draft, version 1 is what's live in the flows
const versionsMock = (assistantVersions = [version(1, true), version(2, false)]) => ({
  request: { query: GET_ASSISTANT_VERSIONS, variables: { assistantId: '1' } },
  result: { data: { assistantVersions } },
});

const defaultMocks = () => [getAssistant('1'), versionsMock()];

const renderDetail = (path = '/ai-evaluation-v2/1', mocks: any[] = defaultMocks()) =>
  render(
    <MockedProvider mocks={mocks}>
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
    expect(screen.getByTestId('healthChip')).toHaveTextContent('Good');
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Version 1 is live in your flows');
    expect(screen.getByTestId('publishButton')).toBeInTheDocument();
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

describe('unsaved changes', () => {
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

    expect(screen.getByTestId('unsavedChanges')).toHaveTextContent('unsaved changes');
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
    expect(screen.getByTestId('promptInput')).toHaveValue('');
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
            temperature: '1',
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
    expect(options[0]).toHaveTextContent(/not published.*saved .*ago/);
    expect(options[1]).toHaveTextContent(/LIVE.*published .*ago/);

    fireEvent.click(screen.getByTestId('versionOption-2'));

    await waitFor(() => {
      expect(screen.getByTestId('versionPill')).toHaveTextContent('Version 2');
    });
    expect(screen.getByTestId('versionPill')).toHaveTextContent('not published');
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
      expect(screen.getByTestId('noVersionPill')).toHaveTextContent('no version saved yet');
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
    expect(screen.getByTestId('newAssistantPill')).toHaveTextContent('new assistant');
    expect(screen.getByTestId('noVersionPill')).toHaveTextContent('no version saved yet');
    expect(screen.getByTestId('liveNote')).toHaveTextContent('Nothing published yet');
    expect(screen.queryByTestId('versionPill')).not.toBeInTheDocument();
    expect(screen.queryByTestId('healthChip')).not.toBeInTheDocument();
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
