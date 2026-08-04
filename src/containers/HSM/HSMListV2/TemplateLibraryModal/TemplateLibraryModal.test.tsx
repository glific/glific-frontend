import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';

import { templateLibraryData, templateLibraryEmptyMock, templateLibraryMock } from 'mocks/Template';
import { TemplateLibraryModal } from './TemplateLibraryModal';

vi.mock('i18next', () => ({
  t: (str: string, options?: Record<string, string>) =>
    options ? str.replace(/{{(.*?)}}/g, (_match, key) => options[key] ?? '') : str,
}));

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

test('never shows Authentication-category entries — there is no tab to reach them from', async () => {
  renderModal();

  await waitFor(() => {
    expect(screen.getByTestId('library-group-list')).toBeInTheDocument();
  });

  expect(screen.queryByText('Otp verification')).not.toBeInTheDocument();
  expect(screen.queryByTestId('library-entry-otp_verification_1')).not.toBeInTheDocument();
});

test('the footer count reflects only Utility entries', async () => {
  renderModal();

  await waitFor(() => {
    // 4 fixtures total, 1 is AUTHENTICATION-category and excluded
    expect(screen.getByText('Showing 3 of 3 templates')).toBeInTheDocument();
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

  // the preview body highlights {{1}} in its own <span>, so the text is split
  // across elements rather than one contiguous text node.
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
  // The backend decodes Gupshup's raw containerMeta string into a real object
  // before it reaches the GraphQL :json scalar - double-encoding it (passing
  // a JSON string straight into a scalar that JSON-encodes again) silently
  // dropped buttons/footer for every entry, since parseContainerMeta's single
  // JSON.parse landed on a string, not an object.
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

  // ACCOUNT_CREATION_CONFIRMATION has an 'nb' entry, so it stays populated...
  await waitFor(() => {
    expect(screen.getByTestId('library-entry-account_creation_confirmation_3')).toBeInTheDocument();
  });
  // ...while APPOINTMENT_REMINDER (english-only) has none for 'nb' and renders dimmed with a hint,
  // rather than disappearing entirely.
  const emptyGroup = screen.getByTestId('library-group-header-APPOINTMENT_REMINDER').closest('div');
  expect(emptyGroup?.className).toMatch(/GroupEmpty/);
  expect(screen.getByText('No Appointment reminder templates in Norwegian Bokmål')).toBeInTheDocument();
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
  // groups with no matching entry are dropped entirely while searching — no
  // dimmed "No … match" placeholder is left behind
  expect(screen.queryByTestId('library-group-header-APPOINTMENT_REMINDER')).not.toBeInTheDocument();
  expect(screen.queryByText('No Appointment reminder templates match "order_confirmation"')).not.toBeInTheDocument();
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
