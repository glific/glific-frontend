import { render, waitFor, fireEvent, screen, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { HSMV2 } from './HSMV2';
import {
  HSM_TEMPLATE_MOCKS,
  getHSMTemplateTypeText,
  getHSMTemplateTypeMedia,
  CREATE_SESSION_TEMPLATE_MOCK,
  templateEditMock,
  deleteTemplateMock,
  sessionTemplatesV2Mock,
} from 'mocks/Template';
import { WHATSAPP_FORM_MOCKS } from 'mocks/WhatsAppForm';
import { uploadMediaSuccessMock, uploadMediaFailureMock } from 'mocks/Attachment';
import { setNotification } from 'common/notification';
import { setOrganizationServices } from 'services/AuthService';
import * as utilsModule from 'common/utils';

const uploadPhotoMock = uploadMediaSuccessMock('photo.png', 'image/png', 'https://gcs.test.com/photo.png');

const mocks = HSM_TEMPLATE_MOCKS;

vi.mock('i18next', () => ({ t: (str: string) => str }));

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn((...args) => {
      return args[1];
    }),
  };
});

vi.mock('lexical-beautiful-mentions', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('lexical-beautiful-mentions');
  return {
    ...actual,
    BeautifulMentionsPlugin: ({ children }: any) => <div>{children}</div>,
    BeautifulMentionsMenuProps: {},
    BeautifulMentionsMenuItemProps: {},
  };
});

const validateMediaSpy = vi.spyOn(utilsModule, 'validateMedia');

describe('HSMV2 edit mode', () => {
  test('HSM form is loaded correctly in edit mode', async () => {
    const MOCKS = [...mocks, getHSMTemplateTypeText, getHSMTemplateTypeText];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter initialEntries={['/templates/1/edit']}>
          <Routes>
            <Route path="/templates/:id/edit" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('HSM Template')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('account_balance');
    });
  });

  test('edit mode with a media attachment and Call to Action buttons loads the media/type/button state', async () => {
    const MOCKS = [...mocks, getHSMTemplateTypeMedia, getHSMTemplateTypeMedia];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter initialEntries={['/templates/1/edit']}>
          <Routes>
            <Route path="/templates/:id/edit" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('HSM Template')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Call Us')).toBeInTheDocument();
    });
  });

  test('copy mode prefixes the label with "Copy of" and leaves the element name blank', async () => {
    const MOCKS = [...mocks, getHSMTemplateTypeText, getHSMTemplateTypeText, ...CREATE_SESSION_TEMPLATE_MOCK];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter initialEntries={[{ pathname: '/templates/1/edit', state: 'copy' }]}>
          <Routes>
            <Route path="/templates/:id/edit" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Copy HSM Template')).toBeInTheDocument();
    });

    // shortcode/isActive aren't carried over in copy mode — only the label is prefilled
    // (with a "Copy of" prefix), so the user has to type a fresh element name.
    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('');
    });
  });
});

describe('HSMV2 add mode', () => {
  const MOCKS = [...mocks, ...WHATSAPP_FORM_MOCKS, ...CREATE_SESSION_TEMPLATE_MOCK];
  const template = (
    <MockedProvider mocks={MOCKS} addTypename={false}>
      <MemoryRouter>
        <HSMV2 />
      </MemoryRouter>
    </MockedProvider>
  );

  const user = userEvent.setup();

  test('renders the form with tile pickers', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    expect(screen.getByTestId('back-button')).toBeInTheDocument();
    expect(screen.getByTestId('simulator-container')).toBeInTheDocument();

    // there's no separate Title field — the backend derives it from shortcode + language.
    expect(screen.queryByPlaceholderText('Title')).not.toBeInTheDocument();

    // creating an HSM here always creates a brand new template — the "translate
    // existing HSM" flow (and its element-name dropdown) lives elsewhere.
    expect(screen.queryByText('Translate existing HSM?')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Element name').tagName).toBe('INPUT');

    // category tiles are rendered from the dynamic category list
    expect(screen.getByText('Account_update')).toBeInTheDocument();

    // interactive button type tiles
    expect(screen.getByText('Quick Reply')).toBeInTheDocument();
    expect(screen.getByText('Call to Action')).toBeInTheDocument();

    expect(screen.queryByText('Maximum 10 quick reply buttons allowed per template')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('e.g., Yes, No, More Info')).not.toBeInTheDocument();
    expect(screen.queryByText('Clear button selection')).not.toBeInTheDocument();
    expect(screen.getByText('Template Details')).toBeInTheDocument();
    expect(screen.getByText('Message Content')).toBeInTheDocument();
    expect(screen.getByText('Interactive Buttons')).toBeInTheDocument();
    expect(screen.getByText('Media Attachment')).toBeInTheDocument();
    expect(screen.getByText('Organization & Tags')).toBeInTheDocument();
    expect(screen.getByTestId('help-icon')).toBeInTheDocument();
  });

  test('submitting without a category shows a friendly required message, not a raw Yup type error', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(screen.getByText('Category is required.')).toBeInTheDocument();
    });
    expect(screen.queryByText(/category must be a `object` type/)).not.toBeInTheDocument();
  });

  test('it should create a template message using the tile pickers', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'element_name' } });
    const lexicalEditor = inputs[1];

    await user.click(lexicalEditor);
    await user.tab();
    fireEvent.input(lexicalEditor, { data: 'Hi, How are you' });

    fireEvent.click(screen.getByText('Account_update'));

    fireEvent.click(screen.getByTestId('bold-icon'));
    fireEvent.click(screen.getByTestId('italic-icon'));
    fireEvent.click(screen.getByTestId('strikethrough-icon'));

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you**')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Variable'));

    fireEvent.click(screen.getByText('Quick Reply'));

    fireEvent.change(screen.getByPlaceholderText('e.g., Yes, No, More Info'), { target: { value: 'Call me' } });

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you** {{1}}')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Define value'), { target: { value: 'User' } });

    fireEvent.change(inputs[2], { target: { value: 'footer' } });

    fireEvent.click(screen.getByTestId('submitActionButton'));
    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('clicking a button type tile reveals its fields and clear selection resets it', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Quick Reply'));
    expect(screen.getByText('Clear button selection')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Yes, No, More Info')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear button selection'));
    expect(screen.queryByText('Clear button selection')).not.toBeInTheDocument();
  });

  test('quick reply buttons show a live character count and can be added/removed', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Quick Reply'));
    expect(screen.getByText('Maximum 10 quick reply buttons allowed per template')).toBeInTheDocument();

    const firstReply = screen.getByPlaceholderText('e.g., Yes, No, More Info');
    expect(screen.getByText('0 / 20')).toBeInTheDocument();
    fireEvent.change(firstReply, { target: { value: 'Yes' } });
    expect(screen.getByText('3 / 20')).toBeInTheDocument();

    expect(screen.queryAllByTestId('delete-icon')).toHaveLength(0);

    fireEvent.click(screen.getByTestId('addButton'));
    expect(screen.getAllByPlaceholderText('e.g., Yes, No, More Info')).toHaveLength(2);
    expect(screen.getAllByTestId('delete-icon')).toHaveLength(2);

    fireEvent.click(screen.getAllByTestId('delete-icon')[1]);
    expect(screen.getAllByPlaceholderText('e.g., Yes, No, More Info')).toHaveLength(1);
  });

  test('call to action chips disable once their limit is reached', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Call to Action'));
    fireEvent.click(screen.getByRole('button', { name: 'Phone number' }));
    expect(screen.getByRole('button', { name: 'Phone number' })).toBeDisabled();
  });

  test('Advanced section reveals URL type and, for Dynamic, a sample suffix field', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Call to Action'));
    fireEvent.click(screen.getByRole('button', { name: 'URL' }));

    expect(screen.queryByText('Static URL')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Advanced'));
    expect(screen.queryByPlaceholderText('Sample Suffix')).not.toBeInTheDocument();
    expect(screen.getByText('Static URL')).toBeInTheDocument();
    expect(screen.getByText('Dynamic URL')).toBeInTheDocument();

    fireEvent.click(await screen.findByText('Dynamic URL'));

    expect(await screen.findByPlaceholderText('Sample Suffix')).toBeInTheDocument();
  });

  test('WhatsApp Form button lets you pick a form, screen, and button title', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","whatsappFormsEnabled":true}');
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('WhatsApp Form'));

    expect(screen.getByText('Select Form*')).toBeInTheDocument();
    expect(screen.getByText('Screen Name*')).toBeInTheDocument();
    expect(screen.getByText('Button Title*')).toBeInTheDocument();

    const formCombo = screen.getByPlaceholderText('Select a form');
    fireEvent.mouseDown(formCombo);
    fireEvent.click(await screen.findByText('This is form name'));

    const screenCombo = await screen.findByPlaceholderText('e.g., contact_us');
    fireEvent.mouseDown(screenCombo);
    fireEvent.click(await screen.findByText('RECOMMEND'));

    fireEvent.change(screen.getByPlaceholderText('e.g., Fill Form'), { target: { value: 'Continue' } });
    expect(screen.getByPlaceholderText('e.g., Fill Form')).toHaveValue('Continue');
  });

  test('every attachment type offers both Provide URL and Upload File, and switching to upload keeps the tile selected', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":true}');
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Document'));
    expect(screen.getByText('How would you like to provide the attachment?')).toBeInTheDocument();
    expect(screen.getByText('Provide URL')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Upload File'));
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PDF (max 16MB)')).toBeInTheDocument();
    // the Document tile should remain selected while the upload method is active
    expect(screen.getByText('Document').closest('button')?.className).toMatch(/TileSelected/);

    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":false}');
  });

  test('clicking Upload File without Google Cloud Storage enabled shows a clear warning instead of the dropzone', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":false}');
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Document'));
    fireEvent.click(screen.getByText('Upload File'));

    expect(screen.queryByText('Click to upload or drag and drop')).not.toBeInTheDocument();
    expect(setNotification).toHaveBeenCalledWith(
      'File upload is not available for your organization. Please use "Provide URL" instead, or ask your admin to enable Google Cloud Storage.',
      'warning'
    );
  });

  test('switching attachment type after uploading a file clears the stale upload state', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":true}');
    const { container } = render(
      <MockedProvider
        mocks={[...mocks, ...WHATSAPP_FORM_MOCKS, ...CREATE_SESSION_TEMPLATE_MOCK, uploadPhotoMock]}
        addTypename={false}
      >
        <MemoryRouter>
          <HSMV2 />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Image'));
    fireEvent.click(screen.getByText('Upload File'));

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [{ name: 'photo.png', type: 'image/png' }] } });

    await waitFor(() => {
      expect(screen.getByText('photo.png', { exact: false })).toBeInTheDocument();
    });

    // switching to a different attachment type should clear the previous upload,
    // not leave a stale "File uploaded" message for a file that no longer applies.
    fireEvent.click(screen.getByText('Document'));
    expect(screen.queryByText('photo.png', { exact: false })).not.toBeInTheDocument();

    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":false}');
  });

  test('clicking an attachment type tile reveals the attachment url field', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Image'));
    expect(screen.getByText('Clear attachment selection')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
    expect(screen.getByText('Max file size:', { exact: false })).toBeInTheDocument();
  });

  test('clicking Clear attachment selection resets the attachment type', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Image'));
    expect(screen.getByText('Clear attachment selection')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear attachment selection'));
    expect(screen.queryByText('Clear attachment selection')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('https://example.com/image.jpg')).not.toBeInTheDocument();
  });

  test('switching from Upload File back to Provide URL brings back the URL field', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":true}');
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Image'));
    fireEvent.click(screen.getByText('Upload File'));
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Provide URL'));
    expect(screen.queryByText('Click to upload or drag and drop')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();

    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":false}');
  });

  test('uploading a PDF for the Document type shows the upload success state', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":true}');
    const uploadPdfMock = uploadMediaSuccessMock('sample.pdf', 'application/pdf', 'https://gcs.test.com/sample.pdf');
    const { container } = render(
      <MockedProvider
        mocks={[...mocks, ...WHATSAPP_FORM_MOCKS, ...CREATE_SESSION_TEMPLATE_MOCK, uploadPdfMock]}
        addTypename={false}
      >
        <MemoryRouter>
          <HSMV2 />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Document'));
    fireEvent.click(screen.getByText('Upload File'));

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [{ name: 'sample.pdf', type: 'application/pdf' }] } });

    await waitFor(() => {
      expect(screen.getByText('sample.pdf', { exact: false })).toBeInTheDocument();
    });

    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":false}');
  });

  test('upload failure shows an error notification and resets the upload state', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":true}');
    const uploadFailureMock = uploadMediaFailureMock('broken.png', 'image/png', 'upload failed');
    const { container } = render(
      <MockedProvider
        mocks={[...mocks, ...WHATSAPP_FORM_MOCKS, ...CREATE_SESSION_TEMPLATE_MOCK, uploadFailureMock]}
        addTypename={false}
      >
        <MemoryRouter>
          <HSMV2 />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Image'));
    fireEvent.click(screen.getByText('Upload File'));

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [{ name: 'broken.png', type: 'image/png' }] } });

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('File upload failed. Please try again.', 'error');
    });
    // the dropzone should come back since the upload state was reset after the failure
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();

    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":false}');
  });

  test('typing an attachment URL triggers media validation', async () => {
    validateMediaSpy.mockResolvedValueOnce({ data: { is_valid: true } } as any);
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Image'));
    const urlInput = screen.getByPlaceholderText('https://example.com/image.jpg');
    fireEvent.change(urlInput, { target: { value: '  https://example.com/img.png  ' } });
    fireEvent.blur(urlInput);

    await waitFor(() => {
      expect(validateMediaSpy).toHaveBeenCalledWith('https://example.com/img.png', 'IMAGE', false);
    });
  });

  test('selecting a language updates the language field', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[0].focus();
    fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });

    fireEvent.click(await screen.findByText('Marathi'));

    expect(screen.getAllByRole('combobox')[0]).toHaveValue('Marathi');
  });

  test('selecting a tag updates the tag field', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    const tagCombo = autocompletes[autocompletes.length - 1];
    tagCombo.focus();
    fireEvent.keyDown(tagCombo, { key: 'ArrowDown' });

    fireEvent.click(await screen.findByText('Messages'));

    expect(screen.getAllByRole('combobox').at(-1)).toHaveValue('Messages');
  });

  test('navigating to Call to Action lets you add, edit, and remove buttons', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Call to Action'));
    fireEvent.click(screen.getByText('Phone number'));
    fireEvent.change(screen.getByPlaceholderText('e.g., Call Us'), { target: { value: 'Call me' } });
    fireEvent.change(screen.getByPlaceholderText('+91 98765 43210'), { target: { value: '9876543210' } });

    // adding a second button while a phone_number button already exists defaults it to "url"
    fireEvent.click(screen.getByTestId('addButton'));
    fireEvent.click(await screen.findByText('Advanced'));
    fireEvent.click(await screen.findByText('Dynamic URL'));

    expect(screen.getAllByTestId('delete-icon')).toHaveLength(2);
    fireEvent.click(screen.getAllByTestId('delete-icon')[1]);
    expect(screen.queryAllByTestId('delete-icon')).toHaveLength(0);
  });

  test('clicking the back icon navigates back to the HSM list', async () => {
    render(
      <MockedProvider mocks={[...mocks, ...WHATSAPP_FORM_MOCKS]} addTypename={false}>
        <MemoryRouter initialEntries={['/template-v2/add']}>
          <Routes>
            <Route path="/template-v2/add" element={<HSMV2 />} />
            <Route path="/template-v2" element={<div>HSM list page</div>} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('back-button'));
    expect(screen.getByText('HSM list page')).toBeInTheDocument();
  });
});

describe('HSMV2 language versions', () => {
  const familyVariants = [
    { id: '1', language: { id: '1', label: 'English', locale: 'en' }, category: 'ACCOUNT_UPDATE', status: 'APPROVED' },
    { id: '2', language: { id: '2', label: 'Hindi', locale: 'hi' }, category: 'ACCOUNT_UPDATE', status: 'PENDING' },
  ];

  test('the dedicated /view route shows the language versions summary read-only, with no "Add new language" option', async () => {
    const MOCKS = [...mocks, getHSMTemplateTypeText];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter initialEntries={[{ pathname: '/templates/1/view', state: { variants: familyVariants } }]}>
          <Routes>
            <Route path="/templates/:id/view" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Language versions')).toBeInTheDocument();
    });

    expect(within(screen.getByTestId('status-tab-Approved')).getByText('1')).toBeInTheDocument();
    expect(within(screen.getByTestId('status-tab-In Progress')).getByText('1')).toBeInTheDocument();
    expect(within(screen.getByTestId('status-tab-Rejected')).getByText('0')).toBeInTheDocument();

    expect(screen.getByTestId('view-language-1')).toBeInTheDocument();
    expect(screen.queryByTestId('view-language-2')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('status-tab-In Progress'));
    expect(screen.getByTestId('view-language-2')).toBeInTheDocument();

    expect(screen.queryByTestId('add-language-link')).not.toBeInTheDocument();
  });

  test('the dedicated /view route never offers Delete — only the add-language flow does', async () => {
    const MOCKS = [...mocks, getHSMTemplateTypeText];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter initialEntries={[{ pathname: '/templates/1/view', state: { variants: familyVariants } }]}>
          <Routes>
            <Route path="/templates/:id/view" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Language versions')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('delete-language-1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('status-tab-In Progress'));
    expect(screen.queryByTestId('delete-language-2')).not.toBeInTheDocument();
  });

  test('deleting a non-anchor sibling from the add-language flow asks for confirmation, then removes it from the list', async () => {
    const MOCKS = [...mocks, ...WHATSAPP_FORM_MOCKS, getHSMTemplateTypeText, deleteTemplateMock('2')];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter
          initialEntries={[{ pathname: '/add', state: { languageAnchorId: '1', variants: familyVariants } }]}
        >
          <Routes>
            <Route path="/add" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Language versions')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('status-tab-In Progress'));
    fireEvent.click(screen.getByTestId('delete-language-2'));

    // clicking Delete doesn't delete immediately — a confirmation dialog gates it.
    expect(screen.getByTestId('view-language-2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.queryByTestId('view-language-2')).not.toBeInTheDocument();
    });
    expect(within(screen.getByTestId('status-tab-In Progress')).getByText('0')).toBeInTheDocument();
  });

  test('deleting the anchor variant itself navigates back to the template list', async () => {
    const MOCKS = [...mocks, ...WHATSAPP_FORM_MOCKS, getHSMTemplateTypeText, deleteTemplateMock('1')];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter
          initialEntries={[{ pathname: '/add', state: { languageAnchorId: '1', variants: familyVariants } }]}
        >
          <Routes>
            <Route path="/add" element={<HSMV2 />} />
            <Route path="/template-v2" element={<div>HSM list page</div>} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Language versions')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-language-1'));
    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(screen.getByText('HSM list page')).toBeInTheDocument();
    });
  });

  test('Rejected variants offer "Edit & Re-apply" instead of "View" on the add-language flow', async () => {
    const MOCKS = [...mocks, ...WHATSAPP_FORM_MOCKS, getHSMTemplateTypeText];
    const variantsWithRejected = [
      ...familyVariants,
      { id: '3', language: { id: '3', label: 'Spanish', locale: 'es' }, category: 'UTILITY', status: 'REJECTED' },
    ];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter
          initialEntries={[{ pathname: '/add', state: { languageAnchorId: '1', variants: variantsWithRejected } }]}
        >
          <Routes>
            <Route path="/add" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Language versions')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('status-tab-Rejected'));
    expect(screen.getByTestId('edit-reapply-language-3')).toBeInTheDocument();
    expect(screen.queryByTestId('view-language-3')).not.toBeInTheDocument();
  });

  test('the dedicated /view route shows "View" (not "Edit & Re-apply") for Rejected variants', async () => {
    const MOCKS = [...mocks, getHSMTemplateTypeText];
    const variantsWithRejected = [
      ...familyVariants,
      { id: '3', language: { id: '3', label: 'Spanish', locale: 'es' }, category: 'UTILITY', status: 'REJECTED' },
    ];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter initialEntries={[{ pathname: '/templates/1/view', state: { variants: variantsWithRejected } }]}>
          <Routes>
            <Route path="/templates/:id/view" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Language versions')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('status-tab-Rejected'));
    expect(screen.getByTestId('view-language-3')).toBeInTheDocument();
    expect(screen.queryByTestId('edit-reapply-language-3')).not.toBeInTheDocument();
  });

  test('clicking "Edit & Re-apply" opens the draft immediately (no dialog, no delete yet); Save deletes the rejected variant, waits for it, then creates and shows the replacement in its real status without leaving the page', async () => {
    const familyRefetchMock = sessionTemplatesV2Mock({ isHsm: true, status: '' }, [
      {
        id: '1',
        bspId: 'bsp-001',
        label: 'Account Balance',
        body: 'body',
        footer: null,
        shortcode: 'element_name',
        status: 'APPROVED',
        category: 'ACCOUNT_UPDATE',
        reason: null,
        isHsm: true,
        isReserved: false,
        isActive: true,
        updatedAt: '2024-01-15T10:00:00Z',
        numberParameters: 0,
        translations: null,
        type: 'TEXT',
        quality: 'HIGH',
        language: { id: '1', label: 'English', locale: 'en' },
        tag: null,
        MessageMedia: null,
      },
      {
        id: '101',
        bspId: null,
        label: 'Account Balance',
        body: 'body',
        footer: null,
        shortcode: 'element_name',
        status: 'PENDING',
        category: 'ACCOUNT_UPDATE',
        reason: null,
        isHsm: true,
        isReserved: false,
        isActive: true,
        updatedAt: '2024-01-15T10:00:00Z',
        numberParameters: 0,
        translations: null,
        type: 'TEXT',
        quality: null,
        language: { id: '3', label: 'Spanish', locale: 'es' },
        tag: null,
        MessageMedia: null,
      },
    ]);
    const MOCKS = [
      ...mocks,
      ...WHATSAPP_FORM_MOCKS,
      getHSMTemplateTypeText,
      getHSMTemplateTypeText,

      templateEditMock('3', { hasButtons: false, buttons: null, buttonType: null }),
      templateEditMock('3', { hasButtons: false, buttons: null, buttonType: null }),
      templateEditMock('101', { hasButtons: false, buttons: null, buttonType: null }),
      templateEditMock('101', { hasButtons: false, buttons: null, buttonType: null }),
      deleteTemplateMock('3'),
      ...CREATE_SESSION_TEMPLATE_MOCK,
      familyRefetchMock,
    ];
    const variantsWithRejected = [
      ...familyVariants,
      { id: '3', language: { id: '3', label: 'Spanish', locale: 'es' }, category: 'UTILITY', status: 'REJECTED' },
    ];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter
          initialEntries={[{ pathname: '/add', state: { languageAnchorId: '1', variants: variantsWithRejected } }]}
        >
          <Routes>
            <Route path="/add" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Language versions')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('status-tab-Rejected'));
    fireEvent.click(screen.getByTestId('edit-reapply-language-3'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('account_balance')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('English')).toBeInTheDocument();
    });
    const languageInput = screen.getAllByRole('combobox')[0];
    expect(languageInput).not.toBeDisabled();

    expect(within(screen.getByTestId('status-tab-Rejected')).getByText('1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Language versions')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(within(screen.getByTestId('status-tab-Rejected')).getByText('0')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(within(screen.getByTestId('status-tab-In Progress')).getByText('1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(within(screen.getByTestId('status-tab-Approved')).getByText('1')).toBeInTheDocument();
    });
  });

  test('"Add new language" prefills the draft from the anchor template and unlocks the Language field', async () => {
    const MOCKS = [...mocks, ...WHATSAPP_FORM_MOCKS, getHSMTemplateTypeText];
    render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/add',
              state: { languageAnchorId: '1', excludeLanguageIds: ['1'], variants: familyVariants },
            },
          ]}
        >
          <Routes>
            <Route path="/add" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Language versions')).toBeInTheDocument();
    });

    const addLanguageButton = screen.getByTestId('add-language-link');
    expect(addLanguageButton).toBeInTheDocument();

    fireEvent.click(addLanguageButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('account_balance')).toBeInTheDocument();
    });

    const languageInput = screen.getAllByRole('combobox')[0];
    expect(languageInput).not.toBeDisabled();

    languageInput.focus();
    fireEvent.keyDown(languageInput, { key: 'ArrowDown' });

    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByText('Marathi')).toBeInTheDocument();
    expect(within(listbox).queryByText('English')).not.toBeInTheDocument();
  });
});
