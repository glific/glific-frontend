import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';

import { setErrorMessage } from 'common/notification';
import {
  templateLibraryData,
  templateLibraryEmptyMock,
  templateLibraryErrorMock,
  templateLibraryMock,
} from 'mocks/Template';
import { languageDisplayName } from './TemplateLibraryModal.helper';
import { TemplateLibraryModal } from './TemplateLibraryModal';

vi.mock('i18next', () => ({
  t: (str: string, options?: Record<string, string>) =>
    options ? str.replace(/{{(.*?)}}/g, (_match, key) => options[key] ?? '') : str,
}));

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setErrorMessage: vi.fn(),
  };
});

const mockedNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedNavigate,
}));

const renderModal = (mocks: any[] = [templateLibraryMock()], open = true, onClose = vi.fn()) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <TemplateLibraryModal open={open} onClose={onClose} />
      </MemoryRouter>
    </MockedProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

test('fetches the catalog and groups Utility entries by usecase, expanded by default', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByTestId('library-group-list')).toBeInTheDocument();
  });

  expect(screen.getByText('Account creation confirmation')).toBeInTheDocument();
  expect(screen.getByTestId('library-entry-appointment_reminder_1')).toBeInTheDocument();
});

test('reopening keeps showing the already-cached list instead of a spinner during the background refetch', async () => {
  const mocks = [templateLibraryMock(), templateLibraryMock()];
  const onClose = vi.fn();
  const tree = (open: boolean) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <TemplateLibraryModal open={open} onClose={onClose} />
      </MemoryRouter>
    </MockedProvider>
  );

  const { rerender } = render(tree(true));

  await waitFor(() => {
    expect(screen.getByTestId('library-group-list')).toBeInTheDocument();
  });

  rerender(tree(false));
  rerender(tree(true));

  expect(screen.getByTestId('library-group-list')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByTestId('library-group-list')).toBeInTheDocument();
  });
});

test('a failed fetch shows an error notification instead of silently rendering an empty catalog', async () => {
  renderModal([templateLibraryErrorMock]);

  await waitFor(() => {
    expect(setErrorMessage).toHaveBeenCalled();
  });
});

test('shows entries as returned by the catalog, category filtering happens server-side', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByTestId('library-group-list')).toBeInTheDocument();
  });

  expect(screen.getByText('Otp verification')).toBeInTheDocument();
  expect(screen.getByTestId('library-entry-otp_verification_1')).toBeInTheDocument();
});

test('the footer count reflects the full catalog', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByText('Showing 4 of 4 templates')).toBeInTheDocument();
  });
});

test('collapsing a group hides its entries, and selecting one shows the reused preview card', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByTestId('library-entry-appointment_reminder_1')).toBeInTheDocument();
  });

  expect(screen.getByText('Select a template to preview it here.')).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('library-group-header-APPOINTMENT_REMINDER'));
  expect(screen.queryByTestId('library-entry-appointment_reminder_1')).not.toBeInTheDocument();

  fireEvent.click(screen.getByTestId('library-group-header-APPOINTMENT_REMINDER'));
  const entry = await screen.findByTestId('library-entry-appointment_reminder_1');
  fireEvent.click(entry);

  await waitFor(() => {
    expect(screen.getByText(/Your appointment is on/)).toBeInTheDocument();
  });
  expect(screen.getByText('{{1}}')).toBeInTheDocument();
  expect(
    screen.getByText(
      'Using this template pre-fills the message body, footer, and button fields. All fields stay fully editable.'
    )
  ).toBeInTheDocument();
});

test('shows buttons from an object-shaped containerMeta - the real backend contract, not a JSON string', async () => {
  const entryWithButtons = {
    elementName: 'system_outage_2',
    category: 'UTILITY',
    body: 'The system outage has been restored for zip code {{1}}.',
    languageCode: 'en',
    industry: 'FINANCIAL_SERVICES',
    topic: 'PUBLIC_DISRUPTION',
    usecase: 'SYSTEM_OUTAGES',
    containerMeta: {
      data: 'The system outage has been restored for zip code {{1}}.',
      buttons: [{ type: 'QUICK_REPLY', text: 'Report Outage' }],
    },
  };

  renderModal([templateLibraryMock([entryWithButtons])]);

  const entry = await screen.findByTestId('library-entry-system_outage_2');
  fireEvent.click(entry);

  await waitFor(() => {
    expect(screen.getByText('Report Outage')).toBeInTheDocument();
  });
});

test('a use case group with no matches for the chosen language stays visible but dimmed', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByTestId('library-group-header-ACCOUNT_CREATION_CONFIRMATION')).toBeInTheDocument();
  });

  fireEvent.mouseDown(within(screen.getByTestId('library-language-filter')).getByRole('combobox'));
  fireEvent.click(await screen.findByRole('option', { name: 'Norwegian Bokmål' }));

  await waitFor(() => {
    expect(screen.getByTestId('library-entry-account_creation_confirmation_3')).toBeInTheDocument();
  });
  const emptyGroup = screen.getByTestId('library-group-header-APPOINTMENT_REMINDER').closest('div');
  expect(emptyGroup?.className).toMatch(/GroupEmpty/);
  expect(screen.getByText('No Appointment reminder templates in Norwegian Bokmål')).toBeInTheDocument();
});

test('closing the modal resets the language filter and collapsed groups for the next open', async () => {
  const mocks = [templateLibraryMock(), templateLibraryMock()];
  const onClose = vi.fn();
  const tree = (open: boolean) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <TemplateLibraryModal open={open} onClose={onClose} />
      </MemoryRouter>
    </MockedProvider>
  );

  const { rerender } = render(tree(true));

  await waitFor(() => {
    expect(screen.getByTestId('library-group-header-ACCOUNT_CREATION_CONFIRMATION')).toBeInTheDocument();
  });

  fireEvent.mouseDown(within(screen.getByTestId('library-language-filter')).getByRole('combobox'));
  fireEvent.click(await screen.findByRole('option', { name: 'Norwegian Bokmål' }));
  fireEvent.click(screen.getByTestId('library-group-header-ACCOUNT_CREATION_CONFIRMATION'));

  expect(screen.queryByTestId('library-entry-account_creation_confirmation_3')).not.toBeInTheDocument();

  fireEvent.click(screen.getByTestId('cancel-button'));
  expect(onClose).toHaveBeenCalled();

  rerender(tree(true));

  await waitFor(() => {
    expect(within(screen.getByTestId('library-language-filter')).getByText('All languages')).toBeInTheDocument();
  });
  expect(screen.getByTestId('library-entry-account_creation_confirmation_3')).toBeInTheDocument();
});

test('search filters entries by element name across the fetched dataset', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByTestId('library-entry-account_creation_confirmation_3')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'order_confirmation' } });

  await waitFor(() => {
    expect(screen.getByTestId('library-entry-order_confirmation_1')).toBeInTheDocument();
  });
  expect(screen.queryByTestId('library-entry-account_creation_confirmation_3')).not.toBeInTheDocument();
  expect(screen.queryByTestId('library-group-header-APPOINTMENT_REMINDER')).not.toBeInTheDocument();
  expect(screen.queryByText('No Appointment reminder templates match "order_confirmation"')).not.toBeInTheDocument();

  fireEvent.submit(screen.getByTestId('searchForm'));
  expect(screen.getByTestId('library-entry-order_confirmation_1')).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('resetButton'));

  await waitFor(() => {
    expect(screen.getByTestId('library-entry-account_creation_confirmation_3')).toBeInTheDocument();
  });
});

test('Create from template stays disabled until a template is selected, then closes and navigates', async () => {
  const onClose = vi.fn();
  renderModal([templateLibraryMock()], true, onClose);

  await waitFor(() => {
    expect(screen.getByTestId('ok-button')).toBeDisabled();
  });

  fireEvent.click(await screen.findByTestId('library-entry-appointment_reminder_1'));
  expect(screen.getByTestId('ok-button')).not.toBeDisabled();

  fireEvent.click(screen.getByTestId('ok-button'));

  expect(onClose).toHaveBeenCalled();
  expect(mockedNavigate).toHaveBeenCalledWith('/template/add', {
    state: { libraryTemplate: { ...templateLibraryData[2], libraryIndex: 2 } },
  });
});

test('selecting one entry does not select other entries that share the same elementName', async () => {
  const duplicateNameData = [
    { ...templateLibraryData[0], languageCode: 'en' },
    { ...templateLibraryData[0], languageCode: 'hi' },
    { ...templateLibraryData[0], languageCode: 'nb' },
  ];
  renderModal([templateLibraryMock(duplicateNameData)]);

  const rows = await screen.findAllByTestId('library-entry-account_creation_confirmation_3');
  expect(rows).toHaveLength(3);
  rows.forEach((row) => expect(row.className).not.toMatch(/EntryRowSelected/));

  fireEvent.click(rows[1]);

  await waitFor(() => {
    expect(rows[1].className).toMatch(/EntryRowSelected/);
  });
  expect(rows[0].className).not.toMatch(/EntryRowSelected/);
  expect(rows[2].className).not.toMatch(/EntryRowSelected/);
});

test('shows an empty state when the catalog has no entries', async () => {
  renderModal([templateLibraryEmptyMock]);

  await waitFor(() => {
    expect(screen.getByText('No templates found.')).toBeInTheDocument();
  });
});

test('languageDisplayName falls back to the raw code in upper case when Intl.DisplayNames rejects it', () => {
  expect(languageDisplayName('not-a-valid-locale!!!')).toBe('NOT-A-VALID-LOCALE!!!');
});
