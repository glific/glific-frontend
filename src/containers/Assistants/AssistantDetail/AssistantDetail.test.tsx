import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import * as Notification from 'common/notification';
import { ASSISTANT_DETAIL_MOCKS, ASSISTANT_DETAIL_SET_LIVE_MOCKS } from 'mocks/Assistants';

import AssistantDetail from './AssistantDetail';

const notificationSpy = vi.spyOn(Notification, 'setNotification');

const renderAssistantDetail = (mocks: any = ASSISTANT_DETAIL_MOCKS) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={['/assistant-new/1']}>
        <Routes>
          <Route path="/assistant-new/:assistantId" element={<AssistantDetail />} />
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
