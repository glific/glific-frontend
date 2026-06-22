import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';

import { setNotification } from 'common/notification';
import { exportCsvFile } from 'common/utils';
import { getFilterTagQuery } from 'mocks/Tag';
import {
  HSM_LIST_V2,
  syncHsmSuccessMock,
  syncHsmErrorMock,
  syncHsmNetworkErrorMock,
  bulkApplyV2Mock,
  bulkApplyV2ErrorsMock,
  bulkApplyV2NetworkErrorMock,
  bulkApplyV2EmptyMock,
  getCategoriesV2Mock,
  filterTemplatesV2Mock,
} from 'mocks/Template';
import HSMListV2 from './HSMListV2';

vi.mock('i18next', () => ({ t: (str: string) => str }));

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return { ...mod, setNotification: vi.fn() };
});

vi.mock('common/utils', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/utils')>();
  return { ...mod, exportCsvFile: vi.fn() };
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

beforeEach(() => {
  vi.clearAllMocks();
});

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
  expect(mockedNavigate).toHaveBeenCalledWith('/template/add');
});

test('shows success notification after Sync HSM', async () => {
  renderComponent([...defaultMocks, syncHsmSuccessMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId('syncHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('HSM queued for sync. Check notifications for updates.', 'success');
  });
});

test('shows warning notification when Sync HSM fails', async () => {
  renderComponent([...defaultMocks, syncHsmErrorMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId('syncHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Sorry, failed to sync HSM updates. Please try again.', 'warning');
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

test('does nothing when file change fires with no file selected', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  vi.mocked(setNotification).mockClear();
  fireEvent.change(screen.getByTestId('import'), { target: { files: [] } });

  expect(setNotification).not.toHaveBeenCalled();
});

test('filters templates by selected category', async () => {
  const categoryMocks = [
    filterTemplatesV2Mock,
    filterTemplatesV2Mock,
    getCategoriesV2Mock,
    getCategoriesV2Mock,
    getFilterTagQuery,
    getFilterTagQuery,
  ];
  renderComponent(categoryMocks);

  await waitFor(() => {
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
  });
  expect(screen.getByText('Feedback Form')).toBeInTheDocument();

  fireEvent.mouseDown(within(screen.getByTestId('categoryFilter')).getByRole('combobox'));
  fireEvent.click(await screen.findByRole('option', { name: 'Utility' }));

  await waitFor(() => {
    expect(screen.queryByText('Feedback Form')).not.toBeInTheDocument();
  });
  expect(screen.getByText('Welcome Message')).toBeInTheDocument();
});

test('filters templates by selected tag', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
  });
  expect(screen.getByText('Feedback Form')).toBeInTheDocument();

  fireEvent.mouseDown(within(screen.getByTestId('tagFilter')).getByRole('combobox'));
  fireEvent.click(await screen.findByRole('option', { name: 'Messages' }));

  await waitFor(() => {
    expect(screen.queryByText('Feedback Form')).not.toBeInTheDocument();
  });
  expect(screen.getByText('Welcome Message')).toBeInTheDocument();
});

test('shows warning notification when Sync HSM throws a network error', async () => {
  renderComponent([...defaultMocks, syncHsmNetworkErrorMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId('syncHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Sorry, failed to sync HSM updates. Please try again.', 'warning');
  });
});

test('exports results and shows success notification after a successful bulk apply', async () => {
  renderComponent([...defaultMocks, bulkApplyV2Mock]);

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['csv content'], 'templates.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(
      'Templates applied successfully. Please check the csv file for the results'
    );
  });
  expect(exportCsvFile).toHaveBeenCalledWith('Title,Status\nTest,Success', 'result');
});

test('shows warning notification when bulk apply returns row errors', async () => {
  renderComponent([...defaultMocks, bulkApplyV2ErrorsMock]);

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['csv content'], 'templates.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith(
      'Templates were processed with errors. Please check the csv file for details.',
      'warning'
    );
  });
});

test('shows no notification and skips export when bulk apply returns an empty response', async () => {
  renderComponent([...defaultMocks, bulkApplyV2EmptyMock]);

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['csv content'], 'templates.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  // returns to the list once processing finishes
  await waitFor(() => {
    expect(screen.getByTestId('bulkApply')).toBeInTheDocument();
  });

  expect(exportCsvFile).not.toHaveBeenCalled();
  expect(setNotification).not.toHaveBeenCalled();
});

test('renders the Template library action button', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('templateLibrary')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('templateLibrary'));
});

test('opens the file picker when Bulk apply is clicked', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('bulkApply')).toBeInTheDocument();
  });

  const clickSpy = vi.spyOn(screen.getByTestId('import') as HTMLInputElement, 'click');
  fireEvent.click(screen.getByTestId('bulkApply'));

  expect(clickSpy).toHaveBeenCalled();
});

test('resets the search via the reset button', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
  });

  const searchInput = screen.getByRole('textbox');
  fireEvent.change(searchInput, { target: { value: 'feedback' } });

  await waitFor(() => {
    expect(screen.queryByText('Welcome Message')).not.toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('resetButton'));

  await waitFor(() => {
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
    expect(screen.getByText('Feedback Form')).toBeInTheDocument();
  });
});

test('shows warning notification when bulk apply throws a network error', async () => {
  renderComponent([...defaultMocks, bulkApplyV2NetworkErrorMock]);

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['csv content'], 'templates.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('An error occured! Please check the format of the file', 'warning');
  });
});
