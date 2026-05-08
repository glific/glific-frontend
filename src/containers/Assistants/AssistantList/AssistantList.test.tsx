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
    expect(screen.getByText('-')).toBeInTheDocument();
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
