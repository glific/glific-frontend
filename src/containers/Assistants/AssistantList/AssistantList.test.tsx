import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import * as Utils from 'common/utils';
import { countAssistantsMock, filterAssistantsMock } from 'mocks/Assistants';

import AssistantList from './AssistantList';

const renderAssistantList = (mocks: any[] = [filterAssistantsMock, countAssistantsMock]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={['/assistants']}>
        <Routes>
          <Route path="/assistants" element={<AssistantList />} />
          <Route path="/assistants/add" element={<div data-testid="create-page" />} />
          <Route path="/assistants/:id" element={<div data-testid="edit-page" />} />
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

test('copy icon calls copyToClipboard with assistant display ID', async () => {
  const copySpy = vi.spyOn(Utils, 'copyToClipboard').mockImplementation(() => {});
  renderAssistantList();

  await waitFor(() => {
    expect(screen.getAllByTestId('copy-icon')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('copy-icon')[0]);

  expect(copySpy).toHaveBeenCalledWith('asst_abc123');
});
