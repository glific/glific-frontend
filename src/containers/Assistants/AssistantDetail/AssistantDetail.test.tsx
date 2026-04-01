import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import * as Notification from 'common/notification';
import * as Utils from 'common/utils';
import { ASSISTANT_DETAIL_MOCKS, ASSISTANT_DETAIL_SAVE_MOCKS, ASSISTANT_DETAIL_SET_LIVE_MOCKS } from 'mocks/Assistants';

import AssistantDetail from './AssistantDetail';

const notificationSpy = vi.spyOn(Notification, 'setNotification');

const renderAssistantDetail = (mocks: any = ASSISTANT_DETAIL_MOCKS, assistantId = '1') =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={[`/assistant-new/${assistantId}`]}>
        <Routes>
          <Route path="/assistant-new/:assistantId" element={<AssistantDetail />} />
          <Route path="/assistants-new" element={<div data-testid="assistants-page" />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

const renderCreateMode = (mocks: any = []) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={['/assistant-new/add']}>
        <Routes>
          <Route path="/assistant-new/:assistantId" element={<AssistantDetail />} />
          <Route path="/assistants-new" element={<div data-testid="assistants-page" />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

test('renders title bar with assistant name, copy ID button, and back button', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
    expect(screen.getByTestId('copyAssistantId')).toBeInTheDocument();
    expect(screen.getByTestId('headerTitle')).toHaveTextContent('Assistant-405db438');
  });
});

test('renders version panel and selects the live version by default', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getAllByTestId('versionCard')).toHaveLength(2);
  });

  // Live badge on version 1
  expect(screen.getByTestId('liveBadge')).toBeInTheDocument();
});

test('clicking a version card loads its data into the config editor', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getAllByTestId('versionCard')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('versionCard')[1]);

  await waitFor(() => {
    expect(screen.getByTestId('configEditorContainer')).toBeInTheDocument();
  });
});

test('config editor shows the correct breadcrumb for selected version', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getByTestId('configEditorContainer')).toBeInTheDocument();
  });

  // Title bar shows assistant name and breadcrumb inside config editor also references it
  await waitFor(() => {
    expect(screen.getAllByText(/Assistant-405db438/).length).toBeGreaterThan(0);
  });
});

test('Set As LIVE button is disabled when version is already live', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getByTestId('setLiveButton')).toBeDisabled();
  });
});

test('Set As LIVE button is enabled for non-live version and triggers mutation', async () => {
  renderAssistantDetail(ASSISTANT_DETAIL_SET_LIVE_MOCKS);

  await waitFor(() => {
    expect(screen.getAllByTestId('versionCard')).toHaveLength(2);
  });

  // Select version 2 (not live)
  fireEvent.click(screen.getAllByTestId('versionCard')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('setLiveButton')).not.toBeDisabled();
  });

  fireEvent.click(screen.getByTestId('setLiveButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Version set as live successfully', 'success');
  });
});

test('opens and closes the expand instructions modal', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getByTestId('expandIcon')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('expandIcon'));

  await waitFor(() => {
    expect(screen.getByText('Edit system instructions')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cancel-button'));

  await waitFor(() => {
    expect(screen.queryByText('Edit system instructions')).not.toBeInTheDocument();
  });
});

test('unsaved changes indicator appears when form is modified', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getByTestId('configEditorContainer')).toBeInTheDocument();
  });

  const textareas = screen.getAllByRole('textbox');
  fireEvent.change(textareas[0], { target: { value: 'New instructions' } });

  await waitFor(() => {
    expect(screen.getByTestId('unsavedIndicator')).toBeInTheDocument();
  });
});

test('renders create mode with correct heading', async () => {
  renderCreateMode();

  await waitFor(() => {
    expect(screen.getByTestId('headerTitle')).toHaveTextContent('Create New Assistant');
  });
});

test('create mode shows Cancel and Save buttons', async () => {
  renderCreateMode();

  await waitFor(() => {
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});

test('cancel button in create mode navigates to /assistants-new', async () => {
  renderCreateMode();

  await waitFor(() => {
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Cancel'));

  await waitFor(() => {
    expect(screen.getByTestId('assistants-page')).toBeInTheDocument();
  });
});

test('create mode does not show version panel', async () => {
  renderCreateMode();

  await waitFor(() => {
    expect(screen.getByTestId('assistantDetailContainer')).toBeInTheDocument();
  });

  expect(screen.queryByTestId('versionCard')).not.toBeInTheDocument();
});

test('create mode does not show copy assistant ID', async () => {
  renderCreateMode();

  await waitFor(() => {
    expect(screen.getByTestId('assistantDetailContainer')).toBeInTheDocument();
  });

  expect(screen.queryByTestId('copyAssistantId')).not.toBeInTheDocument();
});

test('shows empty state when no version is selected', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getByText('Select a version to view and edit.')).toBeInTheDocument();
  });
});

test('clicking copy assistant ID calls copyToClipboard', async () => {
  const copySpy = vi.spyOn(Utils, 'copyToClipboard').mockImplementation(() => {});
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getByTestId('copyAssistantId')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('copyAssistantId'));
  expect(copySpy).toHaveBeenCalledWith('asst_JhYmNWzpCVBZY2vTuohvmqjs');
});

test('unsaved changes modal shows when switching version with unsaved edits', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getAllByTestId('versionCard')).toHaveLength(2);
  });

  // Modify the form
  const textareas = screen.getAllByRole('textbox');
  fireEvent.change(textareas[0], { target: { value: 'Changed instructions' } });

  fireEvent.click(screen.getAllByTestId('versionCard')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('version-switch-stay')).toBeInTheDocument();
  });
});

test('clicking Stay in unsaved changes modal dismisses it without switching version', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getAllByTestId('versionCard')).toHaveLength(2);
  });

  const textareas = screen.getAllByRole('textbox');
  fireEvent.change(textareas[0], { target: { value: 'Changed' } });
  fireEvent.click(screen.getAllByTestId('versionCard')[0]);

  await waitFor(() => {
    expect(screen.getAllByText('Unsaved changes').length).toBeGreaterThan(0);
    expect(screen.getByTestId('version-switch-stay')).toBeInTheDocument();
    expect(screen.getByTestId('version-switch-leave')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('version-switch-stay'));

  await waitFor(() => {
    expect(screen.queryByTestId('version-switch-stay')).not.toBeInTheDocument();
  });
});

test('Leave button in unsaved changes modal closes the modal', async () => {
  renderAssistantDetail();

  await waitFor(() => {
    expect(screen.getAllByTestId('versionCard')).toHaveLength(2);
  });

  const textareas = screen.getAllByRole('textbox');
  fireEvent.change(textareas[0], { target: { value: 'Changed' } });
  fireEvent.click(screen.getAllByTestId('versionCard')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('version-switch-leave')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('version-switch-leave'));

  await waitFor(() => {
    expect(screen.queryByTestId('version-switch-leave')).not.toBeInTheDocument();
  });
});

test('save button in edit mode triggers notification on success', async () => {
  renderAssistantDetail(ASSISTANT_DETAIL_SAVE_MOCKS);

  await waitFor(() => {
    expect(screen.getAllByTestId('versionCard')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('versionCard')[1]);

  await waitFor(() => {
    expect(screen.getByTestId('saveVersionButton')).toBeInTheDocument();
  });

  const textareas = screen.getAllByRole('textbox');
  fireEvent.change(textareas[0], { target: { value: 'Updated instructions' } });

  notificationSpy.mockClear();
  fireEvent.click(screen.getByTestId('saveVersionButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Changes saved successfully', 'success');
  });
});
