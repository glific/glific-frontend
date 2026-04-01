import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import * as Utils from 'common/utils';
import { DELETE_ASSISTANT } from 'graphql/mutations/Assistant';
import { FILTER_ASSISTANTS, GET_ASSISTANTS_COUNT } from 'graphql/queries/Assistant';

import AssistantList from './AssistantList';

const filterMock = {
  request: {
    query: FILTER_ASSISTANTS,
    variables: { filter: {}, opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'name' } },
  },
  result: {
    data: {
      assistants: [
        {
          id: '1',
          name: 'Assistant-1',
          assistantDisplayId: 'asst_abc123',
          liveVersionNumber: 3,
          updatedAt: '2024-10-16T15:58:26Z',
          insertedAt: '2024-10-16T15:58:26Z',
          status: 'active',
          cloneStatus: 'none',
        },
        {
          id: '2',
          name: 'Assistant-2',
          assistantDisplayId: 'asst_def456',
          liveVersionNumber: null,
          updatedAt: '2024-10-17T10:00:00Z',
          insertedAt: '2024-10-17T10:00:00Z',
          status: 'active',
          cloneStatus: 'none',
        },
      ],
    },
  },
};

const countMock = {
  request: {
    query: GET_ASSISTANTS_COUNT,
    variables: { filter: {} },
  },
  result: { data: { countAssistants: 2 } },
};

const deleteMock = {
  request: {
    query: DELETE_ASSISTANT,
    variables: { deleteAssistantId: '1' },
  },
  result: {
    data: {
      deleteAssistant: {
        assistant: { assistantId: '1', name: 'Assistant-1' },
        errors: null,
      },
    },
  },
};

const renderAssistantList = (mocks: any[] = [filterMock, countMock]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={['/assistants-new']}>
        <Routes>
          <Route path="/assistants-new" element={<AssistantList />} />
          <Route path="/assistant-new/add" element={<div data-testid="create-page" />} />
          <Route path="/assistant-new/:id" element={<div data-testid="edit-page" />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );

test('renders AI Assistant heading', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
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

test('Create New Assistant button navigates to /assistant-new/add', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getByText('Create New Assistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Create New Assistant'));

  await waitFor(() => {
    expect(screen.getByTestId('create-page')).toBeInTheDocument();
  });
});

test('edit icon navigates to /assistant-new/:id', async () => {
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getAllByTestId('edit-icon')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('edit-icon')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('edit-page')).toBeInTheDocument();
  });
});

test('copy icon calls copyToClipboard with assistant display ID', async () => {
  const copySpy = vi.spyOn(Utils, 'copyToClipboard').mockImplementation(() => {});
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getAllByTestId('copy-icon')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('copy-icon')[0]);

  expect(copySpy).toHaveBeenCalledWith('asst_abc123');
});
