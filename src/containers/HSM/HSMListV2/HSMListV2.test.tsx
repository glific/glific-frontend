import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';

import { setNotification } from 'common/notification';
import { getFilterTagQuery } from 'mocks/Tag';
import {
  HSM_LIST_V2,
  syncHsmSuccessMock,
  syncHsmErrorMock,
  bulkApplyV2Mock,
} from 'mocks/Template';
import HSMListV2 from './HSMListV2';

vi.mock('i18next', () => ({ t: (str: string) => str }));

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return { ...mod, setNotification: vi.fn() };
});

const mockedNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedNavigate,
}));

const defaultMocks = [...HSM_LIST_V2, getFilterTagQuery, getFilterTagQuery];

const renderComponent = (mocks: any[] = defaultMocks) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <HSMListV2 />
      </MemoryRouter>
    </MockedProvider>
  );

test('renders page title and action buttons', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('Templates')).toBeInTheDocument();
  });

  expect(screen.getByTestId('bulkApply')).toBeInTheDocument();
  expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  expect(screen.getByTestId('createTemplate')).toBeInTheDocument();
});

test('renders grouped template rows after data loads', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
  });

  expect(screen.getByText('Feedback Form')).toBeInTheDocument();
});

test('filters templates by search term', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
  });

  const searchInput = screen.getByRole('textbox');
  fireEvent.change(searchInput, { target: { value: 'feedback' } });

  await waitFor(() => {
    expect(screen.queryByText('Welcome Message')).not.toBeInTheDocument();
    expect(screen.getByText('Feedback Form')).toBeInTheDocument();
  });
});

test('clears search and shows all templates on reset', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
  });

  const searchInput = screen.getByRole('textbox');
  fireEvent.change(searchInput, { target: { value: 'feedback' } });

  await waitFor(() => {
    expect(screen.queryByText('Welcome Message')).not.toBeInTheDocument();
  });

  fireEvent.change(searchInput, { target: { value: '' } });

  await waitFor(() => {
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
    expect(screen.getByText('Feedback Form')).toBeInTheDocument();
  });
});

test('renders category and tag filter dropdowns', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('categoryFilter')).toBeInTheDocument();
    expect(screen.getByTestId('tagFilter')).toBeInTheDocument();
  });
});

test('navigates to create template page on Create click', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('createTemplate')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('createTemplate'));
  expect(mockedNavigate).toHaveBeenCalledWith('/template-v2/add');
});

test('shows success notification after Sync HSM', async () => {
  renderComponent([...defaultMocks, syncHsmSuccessMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId('syncHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(
      'HSM queued for sync. Check notifications for updates.',
      'success'
    );
  });
});

test('shows warning notification when Sync HSM fails', async () => {
  renderComponent([...defaultMocks, syncHsmErrorMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId('syncHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Sorry, failed to sync HSM updates.', 'warning');
  });
});

test('shows loading screen while bulk apply processes', async () => {
  renderComponent([...defaultMocks, bulkApplyV2Mock]);

  await waitFor(() => {
    expect(screen.getByTestId('bulkApply')).toBeInTheDocument();
  });

  const mockFile = new File(['csv content'], 'templates.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getByText('Please wait while we process all the templates')).toBeInTheDocument();
  });
});

test('shows warning when non-CSV file is uploaded', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['content'], 'templates.xlsx', { type: 'application/vnd.ms-excel' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  expect(setNotification).toHaveBeenCalledWith('Please upload a valid CSV file', 'warning');
});
