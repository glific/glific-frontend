import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';

import { setNotification } from 'common/notification';
import { copyToClipboardMethod, exportCsvFile } from 'common/utils';
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
  filterTemplatesV2CategoryMock,
  templateCountV2CategoryMock,
  filterTemplatesV2TagMock,
  templateCountV2TagMock,
  filterTemplatesV2SearchMock,
  templateCountV2SearchMock,
  filterTemplatesV2RejectedMock,
  templateCountV2RejectedMock,
  filterTemplatesV2AllMock,
  templateCountV2AllMock,
} from 'mocks/Template';
import HSMListV2 from './HSMListV2';

vi.mock('i18next', () => ({ t: (str: string) => str }));

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return { ...mod, setNotification: vi.fn() };
});

vi.mock('common/utils', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/utils')>();
  return { ...mod, exportCsvFile: vi.fn(), copyToClipboardMethod: vi.fn() };
});

const mockedNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedNavigate,
}));

// the shared List component fires the filter/count queries multiple times
// (initial + refetch on mount), so duplicate the base mocks generously.
const baseMocks = [...HSM_LIST_V2, ...HSM_LIST_V2, getFilterTagQuery, getFilterTagQuery, getFilterTagQuery];

const renderComponent = (mocks: any[] = baseMocks) =>
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
    expect(screen.getByText('HSM Templates')).toBeInTheDocument();
  });

  // Bulk apply is rendered via the shared ImportButton (hidden file input).
  expect(screen.getByTestId('import')).toBeInTheDocument();
  expect(screen.getByText('Bulk apply')).toBeInTheDocument();
  expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  // Create is the List header button.
  expect(screen.getByTestId('newItemButton')).toBeInTheDocument();
});

test('does not render the removed Template library button', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('HSM Templates')).toBeInTheDocument();
  });

  expect(screen.queryByTestId('templateLibrary')).not.toBeInTheDocument();
});

test('renders template rows after data loads', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  expect(screen.getByText('feedback_form')).toBeInTheDocument();
});

test('renders the status, category and tag filters', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('dropdown-template')).toBeInTheDocument();
  });

  expect(screen.getByTestId('categoryFilter')).toBeInTheDocument();
  expect(screen.getByTestId('AutocompleteInput')).toBeInTheDocument();
});

test('defaults the status filter to Approved', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('dropdown-template')).toBeInTheDocument();
  });

  expect(screen.getByTestId('dropdown-template')).toHaveTextContent('Approved');
});

test('renders the quality rating chip on each title', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  // welcome_msg has quality HIGH; feedback_form has no quality -> "Not Rated".
  expect(screen.getByText('HIGH')).toBeInTheDocument();
  expect(screen.getByText('Not Rated')).toBeInTheDocument();
});

test('navigates to create template page on Create click', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('newItemButton')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('newItemButton'));
  expect(mockedNavigate).toHaveBeenCalledWith('/template/add');
});

test('navigates to create template page with the selected tag', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  // comboboxes: [0] status filter, [1] category filter, [2] tag autocomplete
  const autoComplete = screen.getAllByRole('combobox')[2];
  autoComplete.focus();
  fireEvent.change(autoComplete, { target: { value: 'Messages' } });
  fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autoComplete, { key: 'Enter' });

  fireEvent.click(screen.getByTestId('newItemButton'));

  expect(mockedNavigate).toHaveBeenCalledWith('/template/add', { state: { tag: { label: 'Messages', id: '1' } } });
});

test('navigates to edit template page via the row View action', async () => {
  renderComponent();

  const viewIcons = await screen.findAllByTestId('view-icon', {}, { timeout: 5000 });
  fireEvent.click(viewIcons[0]);

  await waitFor(() => {
    expect(mockedNavigate).toHaveBeenCalledWith('/template/1/edit');
  });
});

test('shows success notification after Sync HSM', async () => {
  renderComponent([...baseMocks, syncHsmSuccessMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId('syncHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('HSM queued for sync. Check notifications for updates.', 'success');
  });
});

test('shows warning notification when Sync HSM fails', async () => {
  renderComponent([...baseMocks, syncHsmErrorMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId('syncHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Sorry, failed to sync HSM updates. Please try again.', 'warning');
  });
});

test('shows warning notification when Sync HSM throws a network error', async () => {
  renderComponent([...baseMocks, syncHsmNetworkErrorMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId('syncHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Sorry, failed to sync HSM updates. Please try again.', 'warning');
  });
});

test('shows loading screen while bulk apply processes', async () => {
  renderComponent([...baseMocks, bulkApplyV2Mock]);

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['csv content'], 'templates.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getByText('Please wait while we process all the templates')).toBeInTheDocument();
  });
});

test('shows warning when a non-CSV file is uploaded', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['content'], 'templates.xlsx', { type: 'application/vnd.ms-excel' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Please upload a valid CSV file', 'warning');
  });
});

test('exports results and shows success notification after a successful bulk apply', async () => {
  renderComponent([...baseMocks, bulkApplyV2Mock]);

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
  renderComponent([...baseMocks, bulkApplyV2ErrorsMock]);

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
  renderComponent([...baseMocks, bulkApplyV2EmptyMock]);

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['csv content'], 'templates.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  // returns to the list once processing finishes
  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  expect(exportCsvFile).not.toHaveBeenCalled();
  expect(setNotification).not.toHaveBeenCalled();
});

test('shows warning notification when bulk apply throws a network error', async () => {
  renderComponent([...baseMocks, bulkApplyV2NetworkErrorMock]);

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['csv content'], 'templates.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('An error occured! Please check the format of the file', 'warning');
  });
});

test('opens the file picker when Bulk apply is clicked', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const clickSpy = vi.spyOn(screen.getByTestId('import') as HTMLInputElement, 'click');
  fireEvent.click(screen.getByText('Bulk apply'));

  expect(clickSpy).toHaveBeenCalled();
});

test('expands a template to reveal its other language variants', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  // the Hindi variant is hidden until the row is expanded
  expect(screen.queryByText('Namaste {{1}}, swagat hai!')).not.toBeInTheDocument();

  const expandIcons = await screen.findAllByTestId('expand-toggle');
  fireEvent.click(expandIcons[0]);

  await waitFor(() => {
    expect(screen.getByText('Namaste {{1}}, swagat hai!')).toBeInTheDocument();
  });

  // clicking the same row again collapses it back
  fireEvent.click(expandIcons[0]);

  await waitFor(() => {
    expect(screen.queryByText('Namaste {{1}}, swagat hai!')).not.toBeInTheDocument();
  });
});

test('copies the bsp UUID via the row Copy UUID action', async () => {
  renderComponent();

  const copyIcons = await screen.findAllByTestId('copy-button');
  fireEvent.click(copyIcons[0]);

  expect(copyToClipboardMethod).toHaveBeenCalledWith('bsp-001');
});

test('warns when copying the UUID of a template without a bsp id', async () => {
  renderComponent();

  const copyIcons = await screen.findAllByTestId('copy-button');
  // feedback_form (second row) has no bspId
  fireEvent.click(copyIcons[1]);

  expect(setNotification).toHaveBeenCalledWith('Sorry! UUID not found', 'warning');
});

test('filters templates by selected status', async () => {
  renderComponent([...baseMocks, filterTemplatesV2RejectedMock, templateCountV2RejectedMock]);

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  fireEvent.mouseDown(within(screen.getByTestId('dropdown-template')).getByRole('combobox'));
  fireEvent.click(await screen.findByRole('option', { name: 'Rejected' }));

  await waitFor(() => {
    expect(screen.queryByText('welcome_msg')).not.toBeInTheDocument();
  });
  expect(screen.getByText('feedback_form')).toBeInTheDocument();
});

test('shows templates of every status when the All filter is selected', async () => {
  renderComponent([...baseMocks, filterTemplatesV2AllMock, templateCountV2AllMock]);

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  fireEvent.mouseDown(within(screen.getByTestId('dropdown-template')).getByRole('combobox'));
  fireEvent.click(await screen.findByRole('option', { name: 'All' }));

  await waitFor(() => {
    expect(screen.getByTestId('dropdown-template')).toHaveTextContent('All');
  });
  expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  expect(screen.getByText('feedback_form')).toBeInTheDocument();
});

test('clears the tag filter and restores the full list', async () => {
  const { container } = renderComponent([...baseMocks, filterTemplatesV2TagMock, templateCountV2TagMock]);

  await waitFor(() => {
    expect(screen.getByText('feedback_form')).toBeInTheDocument();
  });

  // comboboxes: [0] status filter, [1] category filter, [2] tag autocomplete
  const autoComplete = screen.getAllByRole('combobox')[2];
  autoComplete.focus();
  fireEvent.change(autoComplete, { target: { value: 'Messages' } });
  fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autoComplete, { key: 'Enter' });

  await waitFor(() => {
    expect(screen.queryByText('feedback_form')).not.toBeInTheDocument();
  });

  // clearing the tag resets the filter and brings the other templates back
  fireEvent.click(container.querySelector('.MuiAutocomplete-clearIndicator') as HTMLElement);

  await waitFor(() => {
    expect(screen.getByText('feedback_form')).toBeInTheDocument();
  });
});

test('filters templates by selected category', async () => {
  renderComponent([...baseMocks, filterTemplatesV2CategoryMock, templateCountV2CategoryMock]);

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });
  expect(screen.getByText('feedback_form')).toBeInTheDocument();

  fireEvent.mouseDown(within(screen.getByTestId('categoryFilter')).getByRole('combobox'));
  fireEvent.click(await screen.findByRole('option', { name: 'Utility' }));

  await waitFor(() => {
    expect(screen.queryByText('feedback_form')).not.toBeInTheDocument();
  });
  expect(screen.getByText('welcome_msg')).toBeInTheDocument();
});

test('filters templates by selected tag', async () => {
  renderComponent([...baseMocks, filterTemplatesV2TagMock, templateCountV2TagMock]);

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });
  expect(screen.getByText('feedback_form')).toBeInTheDocument();

  // comboboxes: [0] status filter, [1] category filter, [2] tag autocomplete
  const autoComplete = screen.getAllByRole('combobox')[2];
  autoComplete.focus();
  fireEvent.change(autoComplete, { target: { value: 'Messages' } });
  fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autoComplete, { key: 'Enter' });

  await waitFor(() => {
    expect(screen.queryByText('feedback_form')).not.toBeInTheDocument();
  });
  expect(screen.getByText('welcome_msg')).toBeInTheDocument();
});

test('filters templates by search term', async () => {
  renderComponent([...baseMocks, filterTemplatesV2SearchMock, templateCountV2SearchMock]);

  await waitFor(() => {
    expect(screen.getByText('feedback_form')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'feedback' } });
  fireEvent.submit(screen.getByTestId('searchForm'));

  await waitFor(() => {
    expect(screen.queryByText('welcome_msg')).not.toBeInTheDocument();
  });
  expect(screen.getByText('feedback_form')).toBeInTheDocument();
});
