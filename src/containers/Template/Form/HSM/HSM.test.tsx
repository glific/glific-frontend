import { render, waitFor, within, fireEvent, screen, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HSM } from './HSM';
import {
  HSM_TEMPLATE_MOCKS,
  getHSMTemplateTypeMedia,
  getHSMTemplateTypeText,
} from 'mocks/Template';
import { setNotification } from 'common/notification';

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

beforeEach(() => {
  cleanup();
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
      expect(getByText('Edit HSM Template')).toBeInTheDocument();
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
      expect(getByText('Edit HSM Template')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getAllByRole('textbox')[0]).toHaveValue('account_update');
    });

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[1]).toHaveValue('IMAGE');
    });
  });
});

describe('Add mode', () => {
  const template = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <HSM />
      </MemoryRouter>
    </MockedProvider>
  );

  const user = userEvent.setup();

  test('check for validations for the HSM form', async () => {
    const { getByText, container } = render(template);
    await waitFor(() => {
      expect(getByText('Add a new HSM Template')).toBeInTheDocument();
    });

    const { queryByText } = within(container.querySelector('form') as HTMLElement);
    fireEvent.click(screen.getByTestId('submitActionButton'));

    // we should have 1 errors
    await waitFor(() => {
      expect(queryByText('Title is required.')).toBeInTheDocument();
    });

    fireEvent.change(container.querySelector('input[name="label"]') as HTMLInputElement, {
      target: {
        value:
          'We are not allowing a really long title, and we should trigger validation for this.',
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
      expect(screen.getByText('Add a new HSM Template')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'element_name' } });
    const lexicalEditor = inputs[2];

    await user.click(lexicalEditor);
    await user.tab();
    fireEvent.input(lexicalEditor, { data: 'Hi, How are you' });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[1].focus();
    fireEvent.keyDown(autocompletes[1], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('ACCOUNT_UPDATE'), { key: 'Enter' });

    fireEvent.click(screen.getByText('Allow meta to re-categorize template?'));

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Variable'));

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you {{1}}')).toBeInTheDocument();
    });
    fireEvent.change(inputs[1], { target: { value: 'element_name' } });

    fireEvent.change(screen.getByPlaceholderText('Define value'), { target: { value: 'User' } });
    fireEvent.change(inputs[1], { target: { value: 'title' } });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('it should add and remove variables', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Add a new HSM Template')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const lexicalEditor = inputs[2];

    await user.click(lexicalEditor);
    await user.tab();
    fireEvent.input(lexicalEditor, { data: 'Hi' });

    await waitFor(() => {
      expect(screen.getByText('Hi')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Variable'));

    await waitFor(() => {
      expect(screen.getByText('Hi {{1}}')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('delete-variable')[0]);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Define value ')).not.toBeInTheDocument();
    });
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
    fireEvent.click(screen.getByText('Quick replies'));

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
    fireEvent.click(screen.getByText('Call to actions'));
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
      expect(screen.getByText('Add a new HSM Template')).toBeInTheDocument();
    });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    const inputs = screen.getAllByRole('textbox');

    autocompletes[2].focus();
    fireEvent.keyDown(autocompletes[2], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('IMAGE'), { key: 'Enter' });

    fireEvent.change(inputs[3], { target: { value: 'https://example.com/image.jpg' } });

    await waitFor(() => {
      expect(inputs[3]).toHaveValue('https://example.com/image.jpg');
    });
  });

  test('it creates a translation of hsm template', async () => {
    render(template);

    await waitFor(() => {
      expect(screen.getByText('Add a new HSM Template')).toBeInTheDocument();
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
});
