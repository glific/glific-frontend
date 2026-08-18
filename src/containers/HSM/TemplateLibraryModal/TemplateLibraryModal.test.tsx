import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing/react';

import { setErrorMessage } from 'common/notification';
import {
  templateLibraryData,
  templateLibraryEmptyMock,
  templateLibraryErrorMock,
  templateLibraryMock,
} from 'mocks/Template';
import { getOrganizationLanguagesQuery, getOrganizationLanguagesQueryWithoutMatch } from 'mocks/Organization';
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
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <TemplateLibraryModal open={open} onClose={onClose} />
      </MemoryRouter>
    </MockedProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

test('fetches the catalog and groups Utility entries by usecase, collapsed by default so topics can be scanned first', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByTestId('library-group-list')).toBeInTheDocument();
  });

  expect(screen.getByText('Account creation confirmation')).toBeInTheDocument();
  expect(screen.queryByTestId('library-entry-appointment_reminder_1')).not.toBeInTheDocument();

  fireEvent.click(screen.getByTestId('library-group-header-APPOINTMENT_REMINDER'));
  expect(await screen.findByTestId('library-entry-appointment_reminder_1')).toBeInTheDocument();
});

test('reopening keeps showing the already-cached list instead of a spinner during the background refetch', async () => {
  const mocks = [templateLibraryMock(), templateLibraryMock()];
  const onClose = vi.fn();
  const tree = (open: boolean) => (
    <MockedProvider mocks={mocks}>
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

  fireEvent.click(screen.getByTestId('library-group-header-OTP_VERIFICATION'));
  expect(await screen.findByTestId('library-entry-otp_verification_1')).toBeInTheDocument();
});

test('the footer count reflects the full catalog', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByText('Showing 4 of 4 templates')).toBeInTheDocument();
  });
});

test('a collapsed topic reveals its entries once expanded, and selecting one shows the reused preview card', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByTestId('library-group-header-APPOINTMENT_REMINDER')).toBeInTheDocument();
  });

  expect(screen.getByText('Select a template to preview it here.')).toBeInTheDocument();
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

  fireEvent.click(screen.getByTestId('library-group-header-APPOINTMENT_REMINDER'));
  expect(screen.queryByTestId('library-entry-appointment_reminder_1')).not.toBeInTheDocument();
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

  fireEvent.click(await screen.findByTestId('library-group-header-SYSTEM_OUTAGES'));
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

  fireEvent.click(screen.getByTestId('library-group-header-ACCOUNT_CREATION_CONFIRMATION'));
  await waitFor(() => {
    expect(screen.getByTestId('library-entry-account_creation_confirmation_3')).toBeInTheDocument();
  });

  const emptyGroup = screen.getByTestId('library-group-header-APPOINTMENT_REMINDER').closest('div');
  expect(emptyGroup?.className).toMatch(/GroupEmpty/);

  fireEvent.click(screen.getByTestId('library-group-header-APPOINTMENT_REMINDER'));
  expect(screen.getByText('No Appointment reminder templates in Norwegian Bokmål')).toBeInTheDocument();
});

test('closing the modal resets the language filter and topic expansion for the next open', async () => {
  const mocks = [templateLibraryMock(), templateLibraryMock()];
  const onClose = vi.fn();
  const tree = (open: boolean) => (
    <MockedProvider mocks={mocks}>
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

  expect(screen.getByTestId('library-entry-account_creation_confirmation_3')).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('cancel-button'));
  expect(onClose).toHaveBeenCalled();

  rerender(tree(true));

  await waitFor(() => {
    expect(within(screen.getByTestId('library-language-filter')).getByText('All languages')).toBeInTheDocument();
  });
  expect(screen.queryByTestId('library-entry-account_creation_confirmation_3')).not.toBeInTheDocument();
});

test('search filters entries by element name across the fetched dataset, auto-expanding matching topics', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByTestId('library-group-list')).toBeInTheDocument();
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
    expect(screen.queryByTestId('library-entry-account_creation_confirmation_3')).not.toBeInTheDocument();
  });
});

test('Create from template stays disabled until a template is selected, then closes and navigates', async () => {
  const onClose = vi.fn();
  renderModal([templateLibraryMock()], true, onClose);

  await waitFor(() => {
    expect(screen.getByTestId('ok-button')).toBeDisabled();
  });

  fireEvent.click(await screen.findByTestId('library-group-header-APPOINTMENT_REMINDER'));
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

  fireEvent.click(await screen.findByTestId('library-group-header-ACCOUNT_CREATION_CONFIRMATION'));
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

test('defaults the language filter to the organization default language when it matches an available option', async () => {
  renderModal([templateLibraryMock(), getOrganizationLanguagesQuery]);

  await waitFor(() => {
    expect(within(screen.getByTestId('library-language-filter')).getByText('English')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('library-group-header-APPOINTMENT_REMINDER'));
  expect(screen.getByTestId('library-entry-appointment_reminder_1')).toBeInTheDocument();
  expect(screen.queryByTestId('library-entry-account_creation_confirmation_3')).not.toBeInTheDocument();
});

test('falls back to All languages when the organization default language has no matching templates', async () => {
  renderModal([templateLibraryMock(), getOrganizationLanguagesQueryWithoutMatch]);

  await waitFor(() => {
    expect(screen.getByTestId('library-group-list')).toBeInTheDocument();
  });

  expect(within(screen.getByTestId('library-language-filter')).getByText('All languages')).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('library-group-header-ACCOUNT_CREATION_CONFIRMATION'));
  expect(screen.getByTestId('library-entry-account_creation_confirmation_3')).toBeInTheDocument();
});
