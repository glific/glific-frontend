import { render, waitFor, within, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { HSM } from './HSM';
import {
  HSM_TEMPLATE_MOCKS,
  getHSMTemplateTypeMedia,
  getHSMTemplateTypeText,
  CREATE_SESSION_TEMPLATE_MOCK,
} from 'mocks/Template';
import { WHATSAPP_FORM_MOCKS } from 'mocks/WhatsAppForm';
import { setNotification } from 'common/notification';
import * as utilsModule from 'common/utils';
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

const validateMediaSpy = vi.spyOn(utilsModule, 'validateMedia');

describe('Edit mode', () => {
  test('HSM form is loaded correctly in edit mode', async () => {
    const MOCKS = [...mocks, getHSMTemplateTypeText, getHSMTemplateTypeText];
    const { getByText, getAllByRole } = render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter initialEntries={['/templates/1/edit']}>
          <Routes>
            <Route path="/templates/:id/edit" element={<HSM />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );
    await waitFor(() => {
      expect(getByText('HSM Template')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getAllByRole('textbox')[0]).toHaveValue('account_balance');
    });
  });

  test('HSM templates with media', async () => {
    const MOCKS = [...mocks, getHSMTemplateTypeMedia, getHSMTemplateTypeMedia];
    const { getByText, getAllByRole } = render(
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <MemoryRouter initialEntries={['/templates/1/edit']}>
          <Routes>
            <Route path="/templates/:id/edit" element={<HSM />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByText('HSM Template')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getAllByRole('textbox')[0]).toHaveValue('account_update');
    });
    const combobox = getAllByRole('combobox');
    combobox[2].focus();
    fireEvent.keyDown(combobox[2], { key: 'ArrowDown' });
    await waitFor(() => {
      expect(getAllByRole('combobox')[2]).toHaveValue('IMAGE');
    });
  });
});

describe('Add mode', () => {
  const MOCKS = [...mocks, ...WHATSAPP_FORM_MOCKS, ...CREATE_SESSION_TEMPLATE_MOCK];
  const template = (
    <MockedProvider mocks={MOCKS} addTypename={false}>
      <MemoryRouter>
        <HSM />
      </MemoryRouter>
    </MockedProvider>
  );

  const user = userEvent.setup();

  test('check for validations for the HSM form', async () => {
    const { getByText, container } = render(template);
    await waitFor(() => {
      expect(getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    const { queryByText } = within(container.querySelector('form') as HTMLElement);
    fireEvent.click(screen.getByTestId('submitActionButton'));

    // we should have 1 errors
    await waitFor(() => {
      expect(queryByText('Title is required.')).toBeInTheDocument();
    });

    fireEvent.change(container.querySelector('input[name="label"]') as HTMLInputElement, {
      target: {
        value: 'We are not allowing a really long title, and we should trigger validation for this.',
      },
    });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    // we should still have 1 errors
    await waitFor(() => {
      expect(queryByText('Title length is too long.')).toBeInTheDocument();
    });
  });

  test('it should create a template message', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'element_name' } });
    fireEvent.change(inputs[1], { target: { value: 'title' } });
    const lexicalEditor = inputs[2];

    await user.click(lexicalEditor);
    await user.tab();
    fireEvent.input(lexicalEditor, { data: 'Hi, How are you' });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[1].focus();
    fireEvent.keyDown(autocompletes[1], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('ACCOUNT_UPDATE'), { key: 'Enter' });

    fireEvent.click(screen.getByTestId('bold-icon'));

    fireEvent.click(screen.getByTestId('italic-icon'));
    fireEvent.click(screen.getByTestId('strikethrough-icon'));

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you**')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Variable'));

    fireEvent.click(screen.getByText('Add buttons'));

    const combobox = screen.getAllByRole('combobox');
    const buttonTypeCombo = combobox[1] as HTMLInputElement;
    fireEvent.mouseDown(buttonTypeCombo);
    fireEvent.click(screen.getByText('Quick Reply'));

    fireEvent.change(screen.getByPlaceholderText('Quick reply 1 title'), { target: { value: 'Call me' } });

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you** {{1}}')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Define value'), { target: { value: 'User' } });

    fireEvent.click(screen.getByText('Add Variable'));
    fireEvent.click(screen.getAllByTestId('delete-variable')[1]);

    autocompletes[3].focus();
    fireEvent.keyDown(autocompletes[3], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('Messages'), { key: 'Enter' });
    fireEvent.change(inputs[3], { target: { value: 'footer' } });
    fireEvent.change(inputs[1], { target: { value: 'title' } });

    fireEvent.click(screen.getByTestId('submitActionButton'));
    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('it should create a hsm template with whatsapp form', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","whatsappFormsEnabled":true}');

    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'element_name' } });
    fireEvent.change(inputs[1], { target: { value: 'title' } });
    const lexicalEditor = inputs[2];

    await user.click(lexicalEditor);
    await user.tab();
    fireEvent.input(lexicalEditor, { data: 'Hi, How are you' });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[1].focus();
    fireEvent.keyDown(autocompletes[1], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('ACCOUNT_UPDATE'), { key: 'Enter' });

    fireEvent.click(screen.getByTestId('bold-icon'));

    fireEvent.click(screen.getByTestId('italic-icon'));
    fireEvent.click(screen.getByTestId('strikethrough-icon'));

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you**')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Variable'));

    fireEvent.click(screen.getByText('Add buttons'));

    const combobox = screen.getAllByRole('combobox');
    const buttonTypeCombo = combobox[1] as HTMLInputElement;
    fireEvent.mouseDown(buttonTypeCombo);
    fireEvent.click(screen.getByText('WhatsApp Form'));

    const comboboxes = screen.getAllByRole('combobox');
    const formCombo = comboboxes[2] as HTMLInputElement;
    fireEvent.mouseDown(formCombo);
    fireEvent.click(screen.getByText('This is form name'));
    const formComboParam = comboboxes[3] as HTMLInputElement;
    fireEvent.mouseDown(formComboParam);

    fireEvent.click(screen.getByText('RECOMMEND'));

    fireEvent.change(screen.getByPlaceholderText('Button Title'), { target: { value: 'Continue' } });

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you** {{1}}')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Define value'), { target: { value: 'User' } });

    fireEvent.click(screen.getByText('Add Variable'));
    fireEvent.click(screen.getAllByTestId('delete-variable')[1]);

    autocompletes[3].focus();
    fireEvent.keyDown(autocompletes[3], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('Messages'), { key: 'Enter' });
    fireEvent.change(inputs[3], { target: { value: 'footer' } });
    fireEvent.change(inputs[1], { target: { value: 'title' } });

    fireEvent.click(screen.getByTestId('submitActionButton'));
    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('should not display WhatsApp Form when whatsappFormsEnabled is false', async () => {
    setOrganizationServices('{"__typename":"OrganizationServicesResult","whatsappFormsEnabled":false}');

    render(template);

    await waitFor(() => {
      expect(screen.getByText('Add a new HSM Template')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Add buttons'));

    const combobox = screen.getAllByRole('combobox');
    const buttonTypeCombo = combobox[1] as HTMLInputElement;
    fireEvent.mouseDown(buttonTypeCombo);
    expect(screen.queryByText('WhatsApp Form')).not.toBeInTheDocument();
  });

  test('it adds quick reply buttons', async () => {
    render(template);

    await waitFor(() => {
      const language = screen.getAllByTestId('AutocompleteInput')[0].querySelector('input');
      expect(language).toHaveValue('English');
    });

    const inputs = screen.getAllByRole('textbox');

    const elementName = inputs[0];
    const title = inputs[1];

    await user.type(title, 'Hello');
    await user.type(elementName, 'welcome');

    const lexicalEditor = inputs[2];

    await user.click(lexicalEditor);
    await user.tab();
    fireEvent.input(lexicalEditor, { data: 'Hi' });

    await waitFor(() => {
      expect(screen.getByText('Hi')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add buttons'));
    const combobox = screen.getAllByRole('combobox');
    fireEvent.mouseDown(combobox[1] as HTMLInputElement);
    fireEvent.click(screen.getByText('Quick Reply'));

    await user.click(screen.getByTestId('addButton'));

    fireEvent.change(screen.getByPlaceholderText('Quick reply 1 title'), {
      target: { value: 'Yes' },
    });

    fireEvent.change(screen.getByPlaceholderText('Quick reply 2 title'), {
      target: { value: 'No' },
    });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[1].focus();
    fireEvent.keyDown(autocompletes[1], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('ACCOUNT_UPDATE'), { key: 'Enter' });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('it adds call to action buttons', async () => {
    render(template);

    await waitFor(() => {
      const language = screen.getAllByTestId('AutocompleteInput')[0].querySelector('input');
      expect(language).toHaveValue('English');
    });

    const inputs = screen.getAllByRole('textbox');

    const elementName = inputs[0];
    const title = inputs[1];

    await user.type(title, 'Hello');
    await user.type(elementName, 'welcome');

    const lexicalEditor = inputs[2];

    await user.click(lexicalEditor);
    await user.tab();
    fireEvent.input(lexicalEditor, { data: 'Hi' });

    await waitFor(() => {
      expect(screen.getByText('Hi')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add buttons'));
    const combobox = screen.getAllByRole('combobox');
    const buttonTypeCombo = combobox[1] as HTMLInputElement;
    fireEvent.mouseDown(buttonTypeCombo);
    fireEvent.click(screen.getByText('Call to Action'));
    fireEvent.click(screen.getByText('Phone number'));

    fireEvent.change(screen.getByPlaceholderText('Button Title'), { target: { value: 'Call me' } });
    fireEvent.change(screen.getByPlaceholderText('Button Value'), {
      target: { value: '9876543210' },
    });

    fireEvent.click(screen.getByText('Add Call to action'));
    fireEvent.click(screen.getAllByTestId('delete-icon')[1]);

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[1].focus();
    fireEvent.keyDown(autocompletes[1], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('ACCOUNT_UPDATE'), { key: 'Enter' });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('adding attachments', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    const inputs = screen.getAllByRole('textbox');

    autocompletes[2].focus();
    fireEvent.keyDown(autocompletes[2], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('IMAGE URL'), { key: 'Enter' });

    fireEvent.change(inputs[3], { target: { value: 'https://example.com/image.jpg' } });

    await waitFor(() => {
      expect(inputs[3]).toHaveValue('https://example.com/image.jpg');
    });
  });

  test('it creates a translation of hsm template', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Translate existing HSM?'));

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[1].focus();
    fireEvent.keyDown(autocompletes[1], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('account_balance'), { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[1]).toHaveValue('account_balance');
    });
  });

  test('it shows Call to Action as the default selected button type on first render', async () => {
    const { getByRole, getAllByTestId, getByText, getAllByRole } = render(template);

    await waitFor(() => {
      const language = getAllByTestId('AutocompleteInput')[0].querySelector('input');
      expect(language).toHaveValue('English');
    });

    fireEvent.click(getByText('Add buttons'));
    const comboboxes = getAllByRole('combobox');
    const buttonTypeCombo = comboboxes[1] as HTMLInputElement;
    expect(buttonTypeCombo.value).toBe('Call to Action');
  });

  test('validateMedia is called with URL without spaces', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Create a new HSM Template')).toBeInTheDocument();
    });

    // Select IMAGE type using the autocomplete dropdown
    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[2].focus();
    fireEvent.keyDown(autocompletes[2], { key: 'ArrowDown' });

    // Find the IMAGE option in the dropdown and click it
    const imageOption = await screen.findByText(
      (content, element) => content === 'IMAGE URL' && element?.tagName.toLowerCase() === 'li'
    );
    fireEvent.click(imageOption);

    // Find the URL input (assuming it's the 4th textbox)
    const inputs = screen.getAllByRole('textbox');
    const urlInput = inputs[4];

    // Enter URL with extra spaces
    const urlWithSpaces = '   https://example.com/image.jpg   ';
    fireEvent.change(urlInput, { target: { value: urlWithSpaces } });

    // Blur the input to trigger validation
    fireEvent.blur(urlInput);

    // Check that validateMedia is called with trimmed version
    await waitFor(() => {
      expect(validateMediaSpy).toHaveBeenCalledWith('https://example.com/image.jpg', expect.anything(), false);
    });
  });

  test('should not allow adding more than 10 quick reply buttons', async () => {
    const { getAllByTestId, getByText, queryByText, getAllByRole, findByLabelText, findByText } = render(template);

    await waitFor(() => {
      const language = getAllByTestId('AutocompleteInput')[0].querySelector('input');
      expect(language).toHaveValue('English');
    });

    fireEvent.click(getByText('Add buttons'));
    const buttonTypeInput = await findByLabelText('Select Button Type');
    fireEvent.mouseDown(buttonTypeInput);

    const comboxes = getAllByRole('combobox')[1];
    fireEvent.click(comboxes);

    fireEvent.click(getByText('Quick Reply'));

    for (let i = 0; i < 9; i += 1) {
      await waitFor(() => {
        const addButton = queryByText('Add Quick Reply');
        expect(addButton).toBeInTheDocument();
        user.click(addButton!);
      });
    }
    const addButtonAfterLimit = queryByText('Add Quick Reply');
    await waitFor(() => {
      expect(addButtonAfterLimit).not.toBeInTheDocument();
    });
  });
});
