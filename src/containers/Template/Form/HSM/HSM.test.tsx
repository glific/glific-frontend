import 'mocks/matchMediaMock';
import { render, waitFor, within, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HSM } from './HSM';
import { TEMPLATE_MOCKS } from 'containers/Template/Template.test.helper';

const mocks = TEMPLATE_MOCKS;

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Edit mode', () => {
  test('HSM form is loaded correctly in edit mode', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
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
    const button: any = queryByText('Submit for Approval');
    await user.click(button);

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

    await user.click(button);

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
    fireEvent.change(inputs[1], { target: { value: 'element_name' } });
    const lexicalEditor = inputs[2];

    await user.click(lexicalEditor);
    await user.tab();
    fireEvent.input(lexicalEditor, { data: 'Hi, How are you' });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[1].focus();
    fireEvent.keyDown(autocompletes[1], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('ACCOUNT_UPDATE'), { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Variable'));

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you {{1}}')).toBeInTheDocument();
    });
    fireEvent.change(inputs[1], { target: { value: 'element_name' } });

    fireEvent.change(screen.getByPlaceholderText('Define value'), { target: { value: 'User' } });

    fireEvent.click(screen.getByTestId('submitActionButton'));
  });
});
