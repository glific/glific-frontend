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
} from 'mocks/Template';
import HSMListV2 from './HSMListV2';
import { languageCode } from './HSMListV2.helper';

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

test('paginates by the flat record count, not the grouped row count', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  // 5 flat language records collapse into 2 grouped rows (welcome_msg + feedback_form),
  // but the pager's offset/limit paginate the flat data, so the pagination footer
  // must read "of 5" (the server's flat count) or later pages become unreachable.
  expect(screen.getByText(/of 5$/)).toBeInTheDocument();
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

test('shows the template name with its shortcode below it (not the quality)', async () => {
  renderComponent();

  await waitFor(() => {
    // the name (label) is the main title
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
  });

  // the shortcode is shown below the name
  expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  // quality is no longer rendered in the title
  expect(screen.queryByText('Not Rated')).not.toBeInTheDocument();
});

test('navigates to create template page on Create click', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByTestId('newItemButton')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('newItemButton'));
  expect(mockedNavigate).toHaveBeenCalledWith('/template-v2/add');
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

  expect(mockedNavigate).toHaveBeenCalledWith('/template-v2/add', { state: { tag: { label: 'Messages', id: '1' } } });
});

test('navigates to the read-only view page via the row View action', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  // scope the action to the welcome_msg row so a sort/order change can't make
  // this assertion target a different template's View icon.
  const row = screen.getByText('welcome_msg').closest('tr') as HTMLElement;
  fireEvent.click(within(row).getByTestId('view-icon'));

  await waitFor(() => {
    expect(mockedNavigate).toHaveBeenCalledWith('/template-v2/1/view');
  });
});

test('navigates to the create page with the anchor template id via the row Add new language action', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  const row = screen.getByText('welcome_msg').closest('tr') as HTMLElement;
  fireEvent.click(within(row).getByTestId('add-language-icon'));

  await waitFor(() => {
    expect(mockedNavigate).toHaveBeenCalledWith('/template-v2/add', { state: { languageAnchorId: '1' } });
  });
});

test('shows success notification after Sync HSM', async () => {
  renderComponent([...baseMocks, syncHsmSuccessMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  await userEvent.click(screen.getByTestId('syncHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('HSM queued for sync. Check notifications for updates.', 'success');
  });
});

test('shows warning notification when Sync HSM fails', async () => {
  renderComponent([...baseMocks, syncHsmErrorMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  await userEvent.click(screen.getByTestId('syncHsm'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Sorry, failed to sync HSM updates. Please try again.', 'warning');
  });
});

test('shows warning notification when Sync HSM throws a network error', async () => {
  renderComponent([...baseMocks, syncHsmNetworkErrorMock]);

  await waitFor(() => {
    expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  });

  await userEvent.click(screen.getByTestId('syncHsm'));

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

test('bulk apply progress shows a progress bar without blocking the rest of the page', async () => {
  renderComponent([...baseMocks, bulkApplyV2Mock]);

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['csv content'], 'templates.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getByTestId('bulkApplyProgressBar')).toBeInTheDocument();
  });

  // the page underneath (title, sync button) should still be visible/mounted, not replaced
  expect(screen.getByText('HSM Templates')).toBeInTheDocument();
  expect(screen.getByTestId('syncHsm')).toBeInTheDocument();
  expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
});

test('clicking cancel dismisses the bulk apply progress dialog immediately', async () => {
  renderComponent([...baseMocks, bulkApplyV2Mock]);

  await waitFor(() => {
    expect(screen.getByTestId('import')).toBeInTheDocument();
  });

  const mockFile = new File(['csv content'], 'templates.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('import'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getByText('Please wait while we process all the templates')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cancel-button'));

  expect(screen.queryByText('Please wait while we process all the templates')).not.toBeInTheDocument();
  expect(setNotification).toHaveBeenCalledWith(
    'Bulk apply cancelled. The upload may still finish in the background.',
    'warning'
  );
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

  // chevron sits inline with the title and drives the same collapseOpen/collapseRow state
  // InteractiveMessageList uses, just rendered as part of the label cell instead of a separate column.
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

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  // scope to the welcome_msg row so ordering changes can't target another row.
  const row = screen.getByText('welcome_msg').closest('tr') as HTMLElement;
  fireEvent.click(within(row).getByTestId('copy-button'));

  expect(copyToClipboardMethod).toHaveBeenCalledWith('bsp-001');
});

test('warns when copying the UUID of a template without a bsp id', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('feedback_form')).toBeInTheDocument();
  });

  // feedback_form has no bspId; scope to its row instead of relying on order.
  const row = screen.getByText('feedback_form').closest('tr') as HTMLElement;
  fireEvent.click(within(row).getByTestId('copy-button'));

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

test('shows the Reason column with the rejection reason when filtering by Rejected', async () => {
  renderComponent([...baseMocks, filterTemplatesV2RejectedMock, templateCountV2RejectedMock]);

  await waitFor(() => {
    expect(screen.getByText('welcome_msg')).toBeInTheDocument();
  });

  fireEvent.mouseDown(within(screen.getByTestId('dropdown-template')).getByRole('combobox'));
  fireEvent.click(await screen.findByRole('option', { name: 'Rejected' }));

  // the "Last updated" column is swapped for a "Reason" column showing the reason
  await waitFor(() => {
    expect(screen.getByText('Content policy violation')).toBeInTheDocument();
  });
  expect(screen.getByRole('columnheader', { name: 'Reason' })).toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'Last updated' })).not.toBeInTheDocument();
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

test('languageCode with no locale returns an empty string instead of throwing', () => {
  expect(languageCode()).toBe('');
});
