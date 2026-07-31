import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import * as Notification from 'common/notification';
import * as Utils from 'common/utils';

import {
  cloneAssistantFromListMock,
  cloneAssistantFromListErrorMock,
  cloneAssistantNullMessageMock,
  cloneLegacyAssistantFromListMock,
  clonePollingCompletedMock,
  clonePollingFailedMock,
  clonePollingInProgressMock,
  countAssistantsMock,
  filterAssistantsMock,
  filterAssistantsAfterCloneMock,
  removeAssistant,
} from 'mocks/Assistants';
import { FILTER_ASSISTANTS, GET_ASSISTANTS_COUNT } from 'graphql/queries/Assistant';

import AssistantList from './AssistantList';

const renderAssistantList = (mocks: any[] = [filterAssistantsMock, countAssistantsMock]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={['/assistants']}>
        <Routes>
          <Route path="/assistants" element={<AssistantList />} />
          <Route path="/assistants/add" element={<div data-testid="create-page" />} />
          <Route path="/assistants/:id" element={<div data-testid="edit-page" />} />
          <Route path="/assistants/:id/version/:versionNumber" element={<div data-testid="edit-page" />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

test('renders AI Assistant heading', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
  });
});

test('renders assistant rows with name and live version', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
    expect(screen.getByText('Version 3')).toBeInTheDocument();
    expect(screen.getByText('Assistant-2')).toBeInTheDocument();
    // one placeholder for Assistant-2's missing live version, plus the evaluation health
    // placeholder on both rows
    expect(screen.getAllByText('-')).toHaveLength(3);
  });
});

test('renders the Evaluation health column with a placeholder value', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getByText('Evaluation health')).toBeInTheDocument();
  });

  const headers = screen.getAllByRole('columnheader').map((cell) => cell.textContent);
  expect(headers.slice(0, 2)).toEqual(['Assistant Name', 'Evaluation health']);

  const firstRowCells = screen.getAllByRole('row')[1].querySelectorAll('td');
  expect(firstRowCells[1]).toHaveTextContent('-');
});

describe('debounced search', () => {
  const searchTerm = 'Assistant-2';

  // the testid sits on MUI's InputBase wrapper, the value setter is on the inner input
  const searchInput = () => screen.getByTestId('searchInput').querySelector('input') as HTMLInputElement;

  const filteredAssistantsMock = {
    request: {
      query: FILTER_ASSISTANTS,
      variables: {
        filter: { name_or_assistant_id: searchTerm },
        opts: { limit: 50, offset: 0, order: 'DESC', orderWith: 'updated_at' },
      },
    },
    result: {
      data: {
        assistants: [
          {
            id: '2',
            name: 'Assistant-2',
            assistantDisplayId: 'asst_def456',
            liveVersionNumber: null,
            activeConfigVersionId: null,
            updatedAt: '2024-10-17T10:00:00Z',
            insertedAt: '2024-10-17T10:00:00Z',
            status: 'active',
            cloneStatus: 'none',
          },
        ],
      },
    },
  };

  const countFilteredAssistantsMock = {
    request: { query: GET_ASSISTANTS_COUNT, variables: { filter: { name_or_assistant_id: searchTerm } } },
    result: { data: { countAssistants: 1 } },
  };

  test('typing filters the list without pressing Enter', async () => {
    renderAssistantList([
      filterAssistantsMock,
      countAssistantsMock,
      filteredAssistantsMock,
      countFilteredAssistantsMock,
    ]);

    await waitFor(() => {
      expect(screen.getByText('Assistant-1')).toBeInTheDocument();
    });

    fireEvent.change(searchInput(), { target: { value: searchTerm } });

    // no Enter / submit — the debounce alone drives the refetch
    await waitFor(() => {
      expect(screen.queryByText('Assistant-1')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Assistant-2')).toBeInTheDocument();
  });

  test('resetting the search restores the unfiltered list', async () => {
    renderAssistantList([
      filterAssistantsMock,
      countAssistantsMock,
      filteredAssistantsMock,
      countFilteredAssistantsMock,
      filterAssistantsMock,
      countAssistantsMock,
    ]);

    await waitFor(() => {
      expect(screen.getByText('Assistant-1')).toBeInTheDocument();
    });

    fireEvent.change(searchInput(), { target: { value: searchTerm } });

    await waitFor(() => {
      expect(screen.queryByText('Assistant-1')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('resetButton'));

    await waitFor(() => {
      expect(screen.getByText('Assistant-1')).toBeInTheDocument();
    });
  });
});

test('hovering the Evaluation health header shows the scoring tooltip', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getByText('Evaluation health')).toBeInTheDocument();
  });

  fireEvent.mouseOver(screen.getByText('Evaluation health'));

  await waitFor(() => {
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Scored 0–1 by our automated judge. 0–0.3 = Needs Improvement. 0.3–0.6 = Needs Refinement. 0.6–1 = Good.'
    );
  });
});

test('renders assistant display ID below name', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getByText('asst_abc123')).toBeInTheDocument();
  });
});

test('Create New Assistant button navigates to /assistants/add', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getByText('Create New Assistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Create New Assistant'));

  await waitFor(() => {
    expect(screen.getByTestId('create-page')).toBeInTheDocument();
  });
});

test('edit icon navigates to /assistants/:id', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getAllByTestId('edit-icon')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('edit-icon')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('edit-page')).toBeInTheDocument();
  });
});

test('clone icon opens confirmation dialog', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getAllByTestId('copy-icon')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('copy-icon')[0]);

  await waitFor(() => {
    expect(screen.getByText('Clone Assistant')).toBeInTheDocument();
    expect(screen.getByText(/This will create a copy of the current live version of/)).toBeInTheDocument();
    expect(screen.getAllByText('Assistant-1').length).toBeGreaterThanOrEqual(1);
  });
});

test('clone dialog cancel closes without calling API', async () => {
  renderAssistantList([filterAssistantsMock, countAssistantsMock]);

  await waitFor(() => {
    expect(screen.getAllByTestId('copy-icon')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('copy-icon')[0]);

  await waitFor(() => {
    expect(screen.getByText('Clone Assistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('No'));

  await waitFor(() => {
    expect(screen.queryByText('Clone Assistant')).not.toBeInTheDocument();
  });
});

test('clone non-legacy assistant passes versionId to API', async () => {
  renderAssistantList([filterAssistantsMock, countAssistantsMock, cloneAssistantFromListMock]);

  await waitFor(() => {
    expect(screen.getAllByTestId('copy-icon')).toHaveLength(2);
  });

  // Assistant-1 has activeConfigVersionId: 'v1' (non-legacy)
  fireEvent.click(screen.getAllByTestId('copy-icon')[0]);

  await waitFor(() => {
    expect(screen.getByText('Clone Assistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Yes'));

  await waitFor(() => {
    expect(screen.queryByText('Clone Assistant')).not.toBeInTheDocument();
  });
});

test('clone legacy assistant does not pass versionId to API', async () => {
  renderAssistantList([filterAssistantsMock, countAssistantsMock, cloneLegacyAssistantFromListMock]);

  await waitFor(() => {
    expect(screen.getAllByTestId('copy-icon')).toHaveLength(2);
  });

  // Assistant-2 has activeConfigVersionId: null (legacy)
  fireEvent.click(screen.getAllByTestId('copy-icon')[1]);

  await waitFor(() => {
    expect(screen.getByText('Clone Assistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Yes'));

  await waitFor(() => {
    expect(screen.queryByText('Clone Assistant')).not.toBeInTheDocument();
  });
});

test('clone API returns errors shows error message', async () => {
  renderAssistantList([filterAssistantsMock, countAssistantsMock, cloneAssistantFromListErrorMock]);

  await waitFor(() => {
    expect(screen.getAllByTestId('copy-icon')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('copy-icon')[0]);

  await waitFor(() => {
    expect(screen.getByText('Clone Assistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Yes'));

  await waitFor(() => {
    expect(screen.queryByText('Clone Assistant')).not.toBeInTheDocument();
  });
});

test('clone API returns null message  uses fallback notification', async () => {
  renderAssistantList([filterAssistantsMock, countAssistantsMock, cloneAssistantNullMessageMock]);

  await waitFor(() => {
    expect(screen.getAllByTestId('copy-icon')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('copy-icon')[0]);

  await waitFor(() => {
    expect(screen.getByText('Clone Assistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Yes'));

  await waitFor(() => {
    expect(screen.queryByText('Clone Assistant')).not.toBeInTheDocument();
  });
});

test('clone mutation throws network error  catch block handles it', async () => {
  const networkErrorMock = {
    request: {
      query: (await import('graphql/mutations/Assistant')).CLONE_ASSISTANT,
      variables: { cloneAssistantId: '1', versionId: 'v1' },
    },
    error: new Error('Network error'),
  };

  renderAssistantList([filterAssistantsMock, countAssistantsMock, networkErrorMock]);

  await waitFor(() => {
    expect(screen.getAllByTestId('copy-icon')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('copy-icon')[0]);

  await waitFor(() => {
    expect(screen.getByText('Clone Assistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Yes'));

  await waitFor(() => {
    expect(screen.queryByText('Clone Assistant')).not.toBeInTheDocument();
  });
});

const notificationSpy = vi.spyOn(Notification, 'setNotification');

const confirmClone = async () => {
  await waitFor(() => expect(screen.getAllByTestId('copy-icon')).toHaveLength(2));
  fireEvent.click(screen.getAllByTestId('copy-icon')[0]);
  await waitFor(() => expect(screen.getByText('Clone Assistant')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Yes'));
  await waitFor(() => expect(screen.queryByText('Clone Assistant')).not.toBeInTheDocument());
};

test('polling detects cloneStatus completed - shows success notification and new clone appears in list', async () => {
  notificationSpy.mockClear();
  renderAssistantList([
    filterAssistantsMock,
    countAssistantsMock,
    cloneAssistantFromListMock,
    clonePollingCompletedMock,
    filterAssistantsAfterCloneMock,
  ]);
  await confirmClone();
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Assistant cloned successfully');
  });
  await waitFor(() => {
    expect(screen.getByText('Copy of Assistant-1')).toBeInTheDocument();
  });
});

test('polling detects cloneStatus failed - shows warning notification', async () => {
  notificationSpy.mockClear();
  renderAssistantList([filterAssistantsMock, countAssistantsMock, cloneAssistantFromListMock, clonePollingFailedMock]);
  await confirmClone();
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Assistant clone failed', 'warning');
  });
});

test('polling stays silent while cloneStatus is in_progress', async () => {
  notificationSpy.mockClear();
  renderAssistantList([
    filterAssistantsMock,
    countAssistantsMock,
    cloneAssistantFromListMock,
    clonePollingInProgressMock,
  ]);
  await confirmClone();
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Assistant clone initiated');
  });
  expect(notificationSpy).not.toHaveBeenCalledWith('Assistant cloned successfully');
  expect(notificationSpy).not.toHaveBeenCalledWith('Assistant clone failed', 'warning');
});

test('clicking copy button in name cell calls copyToClipboard with assistantDisplayId', async () => {
  const copySpy = vi.spyOn(Utils, 'copyToClipboard').mockImplementation(() => {});
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getAllByTestId('copyAssistantId')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('copyAssistantId')[0]);

  expect(copySpy).toHaveBeenCalledWith('asst_abc123');
  copySpy.mockRestore();
});

test('delete assistant calls deleteModifier with deleteAssistantId', async () => {
  renderAssistantList([filterAssistantsMock, countAssistantsMock, removeAssistant]);

  await waitFor(() => {
    expect(screen.getAllByTestId('DeleteIcon')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('DeleteIcon')[0]);

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Confirm'));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
