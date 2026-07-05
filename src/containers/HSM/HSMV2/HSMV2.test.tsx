import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { HSMV2 } from './HSMV2';
import { HSM_TEMPLATE_MOCKS, getHSMTemplateTypeText, CREATE_SESSION_TEMPLATE_MOCK } from 'mocks/Template';
import { WHATSAPP_FORM_MOCKS } from 'mocks/WhatsAppForm';
import { setNotification } from 'common/notification';
import { setOrganizationServices } from 'services/AuthService';

const mocks = HSM_TEMPLATE_MOCKS;

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
      expect(screen.getByText('Edit HSM Template')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('account_balance');
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

  test('renders the new card layout with tile pickers', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create HSM Template')).toBeInTheDocument();
    });

    expect(screen.getByText('Back to templates')).toBeInTheDocument();
    expect(screen.getByText('Template Details')).toBeInTheDocument();
    expect(screen.getByText('Message Content')).toBeInTheDocument();
    expect(screen.getByText('Interactive Buttons')).toBeInTheDocument();
    expect(screen.getByText('Media Attachment')).toBeInTheDocument();
    expect(screen.getByText('Organization & Tags')).toBeInTheDocument();
    expect(screen.getByTestId('simulator-container')).toBeInTheDocument();

    // there's no separate Title field — the element name doubles as the title.
    expect(screen.queryByPlaceholderText('Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Title', { exact: true })).not.toBeInTheDocument();

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
      expect(screen.getByText('Create HSM Template')).toBeInTheDocument();
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
      expect(screen.getByText('Create HSM Template')).toBeInTheDocument();
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
      expect(screen.getByText('Create HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Document'));
    expect(screen.getByText('How would you like to provide the attachment?')).toBeInTheDocument();
    expect(screen.getByText('Provide URL')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Upload File'));
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PDF (max 16MB)')).toBeInTheDocument();
    // the Document tile should remain selected while the upload method is active
    expect(screen.getByText('Document').closest('button')?.className).toMatch(/TileSelectedGreen/);

    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":false}');
  });

  test('clicking Upload File without Google Cloud Storage enabled shows a clear warning instead of the dropzone', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","googleCloudStorage":false}');
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Document'));
    fireEvent.click(screen.getByText('Upload File'));

    expect(screen.queryByText('Click to upload or drag and drop')).not.toBeInTheDocument();
    expect(setNotification).toHaveBeenCalledWith(
      'File upload is not available for your organization. Please use "Provide URL" instead, or ask your admin to enable Google Cloud Storage.',
      'warning'
    );
  });

  test('clicking an attachment type tile reveals the attachment url field', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Image'));
    expect(screen.getByText('Clear attachment selection')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
    expect(screen.getByText('Max file size:', { exact: false })).toBeInTheDocument();
  });
});
