import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { HSMV2 } from './HSMV2';
import {
  HSM_TEMPLATE_MOCKS,
  getHSMTemplateTypeText,
  getHSMTemplateTypeMedia,
  CREATE_SESSION_TEMPLATE_MOCK,
  getWelcomeTemplateMock,
  getWelcomeTemplateHindiMock,
  getCategoriesV2Mock,
} from 'mocks/Template';
import { getOrganizationLanguagesQueryByOrder } from 'mocks/Organization';
import { getFilterTagQuery } from 'mocks/Tag';
import { WHATSAPP_FORM_MOCKS } from 'mocks/WhatsAppForm';
import { setNotification } from 'common/notification';
import { setOrganizationServices } from 'services/AuthService';
import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import * as utilsModule from 'common/utils';

const uploadPhotoMock = {
  request: {
    query: UPLOAD_MEDIA,
    variables: { media: { name: 'photo.png', type: 'image/png' }, extension: 'png' },
  },
  result: { data: { uploadMedia: 'https://gcs.test.com/photo.png' } },
};

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

    fireEvent.change(screen.getByPlaceholderText('Quick reply 1 title'), { target: { value: 'Call me' } });

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
    expect(screen.getByPlaceholderText('Quick reply 1 title')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear button selection'));
    expect(screen.queryByText('Clear button selection')).not.toBeInTheDocument();
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
    const uploadPdfMock = {
      request: {
        query: UPLOAD_MEDIA,
        variables: { media: { name: 'sample.pdf', type: 'application/pdf' }, extension: 'pdf' },
      },
      result: { data: { uploadMedia: 'https://gcs.test.com/sample.pdf' } },
    };
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
    const uploadFailureMock = {
      request: {
        query: UPLOAD_MEDIA,
        variables: { media: { name: 'broken.png', type: 'image/png' }, extension: 'png' },
      },
      error: new Error('upload failed'),
    };
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
    fireEvent.change(screen.getByPlaceholderText('Button Title'), { target: { value: 'Call me' } });
    fireEvent.change(screen.getByPlaceholderText('Button Value'), { target: { value: '9876543210' } });

    // adding a second button while a phone_number button already exists defaults it to "url"
    fireEvent.click(screen.getByTestId('addButton'));
    const urlTypeCombo = await screen.findByLabelText('Select URL Type');
    fireEvent.mouseDown(urlTypeCombo);
    fireEvent.click(await screen.findByText('Dynamic'));

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

  test('adding a new language prefills the form from the anchor template and locks the element name', async () => {
    render(
      <MockedProvider
        mocks={[...mocks, ...WHATSAPP_FORM_MOCKS, getWelcomeTemplateMock, getWelcomeTemplateMock]}
        addTypename={false}
      >
        <MemoryRouter
          initialEntries={[
            { pathname: '/template-v2/add', state: { languageAnchorId: '1', excludeLanguageIds: ['1'] } },
          ]}
        >
          <HSMV2 />
        </MemoryRouter>
      </MockedProvider>
    );

    // Landing here shows the anchor read-only first, as a reference — its own
    // "welcome_msg" title (not FormLayout's generic create title).
    await waitFor(() => {
      expect(screen.getByText('welcome_msg', { exact: false })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Hi {{1}}, welcome!', { exact: false })).toBeInTheDocument();
    });
    expect(screen.queryByTestId('submitActionButton')).not.toBeInTheDocument();

    // clicking "+ Add new language" switches to the editable draft.
    fireEvent.click(screen.getByTestId('add-language-link'));

    // shortcode is prefilled from the anchor and locked — every language
    // variant of a template shares the same shortcode.
    await waitFor(() => {
      const elementNameInput = screen.getByPlaceholderText('Element name') as HTMLInputElement;
      expect(elementNameInput).toHaveValue('welcome_msg');
      expect(elementNameInput).toBeDisabled();
    });

    // body is prefilled but stays editable, so the translator only has to
    // change the wording.
    await waitFor(() => {
      expect(screen.getByText('Hi {{1}}, welcome!', { exact: false })).toBeInTheDocument();
    });

    // category tiles stay editable too (not disabled, unlike isEditing mode).
    expect(screen.getByText('Account_update').closest('button')).not.toBeDisabled();
  });
});

describe('HSMV2 language mode', () => {
  // matches the shape HSMListV2's row carries on `item.variants` (see
  // HSMListV2.helper's getColumns) and passes through navigation state.
  const welcomeVariants = [
    { id: '1', language: { id: '1', label: 'English', locale: 'en' }, status: 'APPROVED', category: 'UTILITY' },
    { id: '2', language: { id: '2', label: 'Hindi', locale: 'hi' }, status: 'APPROVED', category: 'UTILITY' },
  ];

  const languageModeMocks = [
    // GET_TEMPLATE for the current variant is fetched twice on each landing —
    // once by HSMV2's own "language anchor" query, once by FormLayout's
    // entityId-driven fetch (both point at the same id in View mode).
    getWelcomeTemplateMock,
    getWelcomeTemplateMock,
    getWelcomeTemplateHindiMock,
    getWelcomeTemplateHindiMock,
    getOrganizationLanguagesQueryByOrder,
    getOrganizationLanguagesQueryByOrder,
    getCategoriesV2Mock,
    getCategoriesV2Mock,
    getFilterTagQuery,
    getFilterTagQuery,
  ];

  const renderAtPath = (pathname: string, state?: any) =>
    render(
      <MockedProvider mocks={languageModeMocks} addTypename={false}>
        <MemoryRouter initialEntries={[{ pathname, state }]}>
          <Routes>
            <Route path="/template-v2/add" element={<HSMV2 />} />
            <Route path="/template-v2/:id/view" element={<HSMV2 />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

  test('View route shows the Template Details card with language versions grouped under the Approved tab', async () => {
    renderAtPath('/template-v2/1/view', { variants: welcomeVariants });

    await waitFor(() => {
      expect(screen.getByTestId('language-versions-list')).toBeInTheDocument();
    });

    // the Template Details card only shows the language-versions list — the
    // form below it already has its own "Element name" field for this.
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Element name')).toHaveValue('welcome_msg');
    });
    expect(screen.getAllByTestId('language-version-row')).toHaveLength(2);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Hindi')).toBeInTheDocument();
  });

  test('View route shows that variant read-only, with fields locked, and no Add new language link', async () => {
    renderAtPath('/template-v2/1/view', { variants: welcomeVariants });

    await waitFor(() => {
      expect(screen.getByText('Hi {{1}}, welcome!', { exact: false })).toBeInTheDocument();
    });

    // no submit button while viewing — isEditing is false here (no :id/edit in
    // the URL), so submitting would otherwise create a duplicate template.
    expect(screen.queryByTestId('submitActionButton')).not.toBeInTheDocument();
    // viewing a variant shows Category as a locked plain text field (like
    // isEditing mode), not the editable tile picker.
    expect(screen.getByDisplayValue('UTILITY')).toBeDisabled();
    // "Add new language" only belongs on the create route, not View.
    expect(screen.queryByTestId('add-language-link')).not.toBeInTheDocument();
  });

  test('clicking View on a sibling variant navigates to its own /view route and loads its content', async () => {
    renderAtPath('/template-v2/1/view', { variants: welcomeVariants });

    await waitFor(() => {
      expect(screen.getByText('Hi {{1}}, welcome!', { exact: false })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('view-language-2'));

    await waitFor(() => {
      expect(screen.getByText('Namaste {{1}}, swagat hai!', { exact: false })).toBeInTheDocument();
    });
  });

  test('Add route shows the anchor read-only first, then the editable draft after clicking Add new language', async () => {
    renderAtPath('/template-v2/add', {
      languageAnchorId: '1',
      excludeLanguageIds: ['1', '2'],
      variants: welcomeVariants,
    });

    // read-only preview of the anchor by default — no submit button yet.
    await waitFor(() => {
      expect(screen.getByText('Hi {{1}}, welcome!', { exact: false })).toBeInTheDocument();
    });
    expect(screen.queryByTestId('submitActionButton')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('UTILITY')).toBeDisabled();
    // "Add new language" is available on this route even in the preview state.
    expect(screen.getByTestId('add-language-link')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('add-language-link'));

    await waitFor(() => {
      expect(screen.getByTestId('submitActionButton')).toBeInTheDocument();
    });

    expect(screen.getByText('Hi {{1}}, welcome!', { exact: false })).toBeInTheDocument();
    // category tiles are editable in the "add" draft.
    const categoryTexts = screen.getAllByText('Utility');
    expect(categoryTexts.at(-1)?.closest('button')).not.toBeDisabled();
    // the shortcode stays locked to the anchor's.
    const elementNameInput = screen.getByPlaceholderText('Element name') as HTMLInputElement;
    expect(elementNameInput).toHaveValue('welcome_msg');
    expect(elementNameInput).toBeDisabled();
  });

  test('Add route\'s own View link previews a sibling variant in place, without navigating away', async () => {
    renderAtPath('/template-v2/add', {
      languageAnchorId: '1',
      excludeLanguageIds: ['1', '2'],
      variants: welcomeVariants,
    });

    await waitFor(() => {
      expect(screen.getByText('Hi {{1}}, welcome!', { exact: false })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('view-language-2'));

    await waitFor(() => {
      expect(screen.getByText('Namaste {{1}}, swagat hai!', { exact: false })).toBeInTheDocument();
    });
    // still read-only, still on the same /add URL — no navigation happened.
    expect(screen.queryByTestId('submitActionButton')).not.toBeInTheDocument();
  });
});
