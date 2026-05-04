import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import {
  createGoldenQaCustomSuccessMock,
  createGoldenQaSuccessMock,
  getAIEvaluationCreateMocks,
  getAssistantConfigVersionsEmptyMock,
  getAssistantConfigVersionsErrorMock,
  getAssistantConfigVersionsLoadingMock,
  getAssistantConfigVersionsMultipleNamesMock,
  getAssistantConfigVersionsMock,
  getCreateEvaluationSuccessMock,
  getListAiEvaluationsMock,
  getListGoldenQaForCreateEmptyMock,
  getListGoldenQaForCreateErrorMock,
  getListGoldenQaForCreateMock,
} from 'mocks/AIEvaluations';
import { setNotification } from 'common/notification';
import AIEvaluationCreate from './AIEvaluationCreate';

vi.mock('common/notification', () => ({
  setNotification: vi.fn(),
  setErrorMessage: vi.fn(),
}));

const defaultMocks = getAIEvaluationCreateMocks();

const wrapper = (mocks: any[] = defaultMocks) => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter initialEntries={['/ai-evaluations/create']}>
      <Routes>
        <Route path="/ai-evaluations/create" element={<AIEvaluationCreate />} />
        <Route path="/chat" element={<div>Chat Page</div>} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

const getGoldenQaAutocompleteRoot = () =>
  screen.getAllByTestId('autocomplete-element').find((el) =>
    within(el).queryByPlaceholderText('Search or select a Golden QA dataset')
  )!;

const getAssistantAutocompleteRoot = () =>
  screen.getAllByTestId('autocomplete-element').find((el) =>
    within(el).queryByPlaceholderText('Search or select an AI assistant')
  )!;

const openGoldenQaAutocomplete = async () => {
  const autocomplete = getGoldenQaAutocompleteRoot();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
  await waitFor(() => {
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
};

const openAssistantAutocomplete = async () => {
  const root = getAssistantAutocompleteRoot();
  fireEvent.focus(within(root).getByRole('combobox'));
  // With zero options, MUI shows noOptionsText in a presentation node, not a listbox.
  await waitFor(() => {
    expect(
      screen.queryByRole('listbox') ||
        screen.queryByText('Fetching assistants...') ||
        screen.queryByText('No assistants available')
    ).toBeTruthy();
  });
};

const fillAndSubmitForm = async (evaluationName = 'test_evaluation') => {
  await waitFor(() => {
    expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
  });

  // Select golden QA from the autocomplete
  await openGoldenQaAutocomplete();
  await waitFor(() => {
    expect(screen.getByRole('option', { name: 'Diabetescare-0101' })).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole('option', { name: 'Diabetescare-0101' }));

  fireEvent.change(screen.getByPlaceholderText('Give a unique name for the evaluation experiment'), {
    target: { value: evaluationName },
  });

  await openAssistantAutocomplete();
  await waitFor(() => {
    expect(screen.getByRole('option', { name: 'Test Assistant (Version 2)' })).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole('option', { name: 'Test Assistant (Version 2)' }));

  fireEvent.click(screen.getByText('Run Evaluation'));
};

describe('AIEvaluationCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders Create AI Evaluation page with title and Run Evaluation button', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    expect(screen.getByText('Run Evaluation')).toBeInTheDocument();
  });

  test('renders all form fields with correct labels', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    expect(screen.getByText('Select Golden QA')).toBeInTheDocument();
    expect(screen.getByText('Evaluation Name*')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant*')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search or select an AI assistant')).toBeInTheDocument();
  });

  test('renders the searchable Golden QA autocomplete', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    expect(within(getGoldenQaAutocompleteRoot()).getByTestId('AutocompleteInput')).toBeInTheDocument();
  });

  test('populates Golden QA dropdown with datasets fetched from backend', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    await openGoldenQaAutocomplete();

    await waitFor(() => {
      expect(screen.getByText('Diabetescare-0101')).toBeInTheDocument();
      expect(screen.getByText('Healthcare-0102')).toBeInTheDocument();
    });
  });

  test('shows no options text when backend returns empty list', async () => {
    render(wrapper([getListAiEvaluationsMock, getAssistantConfigVersionsMock, getListGoldenQaForCreateEmptyMock]));

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    // Type in the autocomplete input to trigger the popup with noOptionsText
    const combobox = within(getGoldenQaAutocompleteRoot()).getByRole('combobox');
    fireEvent.change(combobox, { target: { value: 'x' } });

    await waitFor(() => {
      expect(screen.getByText('No Golden QA datasets available')).toBeInTheDocument();
    });
  });

  test('shows error notification when fetching golden QA datasets fails', async () => {
    render(wrapper([getListAiEvaluationsMock, getAssistantConfigVersionsMock, getListGoldenQaForCreateErrorMock]));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('Failed to fetch golden QA datasets', 'warning');
    });
  });

  test('shows Golden QA helper content with CSV format and template link', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Select Golden QA')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Select the Golden QA dataset from the existing list or upload a new set/)
    ).toBeInTheDocument();
    expect(screen.getByText('Expected CSV Format:')).toBeInTheDocument();
    expect(screen.getByText('Question, Answer')).toBeInTheDocument();
    expect(screen.getByText('"What Is X","Answer"')).toBeInTheDocument();
    expect(screen.getByText('Click Here For The Template Csv')).toBeInTheDocument();
  });

  test('renders Upload Golden QA button', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Upload Golden QA' })).toBeInTheDocument();
  });

  test('clicking Upload Golden QA opens file input and selecting CSV opens UploadGoldenQaDialog', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', { name: 'Upload Golden QA' });
    fireEvent.click(uploadButton);

    const fileInput = document.querySelector('input[type="file"][accept=".csv"]');
    expect(fileInput).toBeInTheDocument();

    const csvFile = new File(['Question,Answer\nq1,a1'], 'golden-qa.csv', { type: 'text/csv' });
    fireEvent.change(fileInput!, { target: { files: [csvFile] } });

    await waitFor(() => {
      expect(screen.getByTestId('dialogTitle')).toHaveTextContent('Upload Golden QA');
      expect(screen.getByText('golden-qa.csv')).toBeInTheDocument();
    });
  });

  test('closing UploadGoldenQaDialog via Cancel hides the dialog', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    const fileInput = document.querySelector('input[type="file"][accept=".csv"]');
    const csvFile = new File(['Question,Answer\nq1,a1'], 'test.csv', { type: 'text/csv' });
    fireEvent.click(screen.getByRole('button', { name: 'Upload Golden QA' }));
    fireEvent.change(fileInput!, { target: { files: [csvFile] } });

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    const dialog = screen.getByTestId('dialogBox');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
    });
  });

  test('shows validation error when evaluation name is empty on submit', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Run Evaluation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Run Evaluation'));

    await waitFor(() => {
      expect(screen.getByText('Evaluation name is required')).toBeInTheDocument();
    });
  });

  test('shows validation error when AI Assistant is not selected on submit', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Give a unique name for the evaluation experiment')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Give a unique name for the evaluation experiment');
    fireEvent.change(nameInput, { target: { value: 'valid_name' } });
    fireEvent.click(screen.getByText('Run Evaluation'));

    await waitFor(() => {
      expect(screen.getByText('Please select an AI Assistant')).toBeInTheDocument();
    });
  });

  test('shows validation error when evaluation name is cleared after being typed', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Give a unique name for the evaluation experiment')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Give a unique name for the evaluation experiment');
    fireEvent.change(nameInput, { target: { value: 'some_name' } });
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('Evaluation name is required')).toBeInTheDocument();
    });
  });

  test('accepts any non-empty evaluation name', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Give a unique name for the evaluation experiment')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Give a unique name for the evaluation experiment');
    fireEvent.change(nameInput, { target: { value: 'valid_evaluation-name123' } });

    expect((nameInput as HTMLInputElement).value).toBe('valid_evaluation-name123');
  });

  test('shows assistant options from query using assistantName and versionNumber', async () => {
    render(wrapper([...defaultMocks]));

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    await openAssistantAutocomplete();

    await waitFor(() => {
      expect(screen.getByText('Test Assistant (Version 2)')).toBeInTheDocument();
      expect(screen.getByText('Test Assistant (Version 1)')).toBeInTheDocument();
    });
  });

  test('Run Evaluation submit button is visible and enabled', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByTestId('submitActionButton')).toBeInTheDocument();
      expect(screen.getByTestId('submitActionButton')).toHaveTextContent('Run Evaluation');
      expect(screen.getByTestId('submitActionButton')).not.toBeDisabled();
    });
  });

  test('shows Fetching assistants... while assistant config versions are loading', async () => {
    const mocks = [getAssistantConfigVersionsLoadingMock, getListGoldenQaForCreateMock];
    render(wrapper(mocks));

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    await openAssistantAutocomplete();

    await waitFor(() => {
      expect(screen.getByText('Fetching assistants...')).toBeInTheDocument();
    });
  });

  test('shows error notification when fetching assistant config versions fails', async () => {
    render(wrapper([getAssistantConfigVersionsErrorMock, getListGoldenQaForCreateMock]));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('Failed to fetch assistants', 'warning');
    });
  });

  test('shows No assistants available when assistant config versions list is empty', async () => {
    const mocks = [getAssistantConfigVersionsEmptyMock, getListGoldenQaForCreateMock];
    render(wrapper(mocks));

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    await openAssistantAutocomplete();

    await waitFor(() => {
      expect(screen.getByText('No assistants available')).toBeInTheDocument();
    });
  });

  test('renders assistant options in the order of their version numbers', async () => {
    render(wrapper([getAssistantConfigVersionsMultipleNamesMock, getListGoldenQaForCreateMock]));

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    await openAssistantAutocomplete();

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveTextContent('Alpha Assistant (Version 1)');
      expect(options[1]).toHaveTextContent('Beta Assistant (Version 1)');
      expect(options[2]).toHaveTextContent('Beta Assistant (Version 2)');
    });
  });

  test('shows all assistant config versions with correct labels for multiple assistant names', async () => {
    const mocks = [getAssistantConfigVersionsMultipleNamesMock, getListGoldenQaForCreateMock];
    render(wrapper(mocks));

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    await openAssistantAutocomplete();

    await waitFor(() => {
      expect(screen.getByText('Alpha Assistant (Version 1)')).toBeInTheDocument();
      expect(screen.getByText('Beta Assistant (Version 1)')).toBeInTheDocument();
      expect(screen.getByText('Beta Assistant (Version 2)')).toBeInTheDocument();
    });
  });

  test('shows success notification and navigates to chat on successful submission', async () => {
    render(wrapper([getListAiEvaluationsMock, getAssistantConfigVersionsMock, getListGoldenQaForCreateMock, getCreateEvaluationSuccessMock]));

    await fillAndSubmitForm();

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('AI evaluation created successfully!');
      expect(screen.getByText('Chat Page')).toBeInTheDocument();
    });
  });

  test('back button is present and navigates away when clicked', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    const backButton = screen.getByTestId('back-button');
    expect(backButton).toBeInTheDocument();
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.queryByText('Create AI Evaluation')).not.toBeInTheDocument();
    });
  });

  test('after uploading golden QA the autocomplete updates to show the uploaded dataset as selected', async () => {
    render(wrapper([...defaultMocks, createGoldenQaSuccessMock]));

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Upload Golden QA' }));
    const fileInput = document.querySelector('input[type="file"][accept=".csv"]');
    const csvFile = new File(['Question,Answer\nq1,a1'], 'golden-qa.csv', { type: 'text/csv' });
    fireEvent.change(fileInput!, { target: { files: [csvFile] } });

    await waitFor(() => {
      expect(screen.getByTestId('dialogTitle')).toHaveTextContent('Upload Golden QA');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
      const autocompleteInput = within(getGoldenQaAutocompleteRoot()).getByTestId('AutocompleteInput').querySelector('input')!;
      expect(autocompleteInput.value).toBe('golden_qa');
    });
  });

  test('newly uploaded dataset appears first and is selected; backend datasets follow', async () => {
    render(wrapper([...defaultMocks, createGoldenQaCustomSuccessMock('my_dataset', 1)]));

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Upload Golden QA' }));
    const fileInput = document.querySelector('input[type="file"][accept=".csv"]');
    const csvFile = new File(['Question,Answer\nq1,a1'], 'my-dataset.csv', { type: 'text/csv' });
    fireEvent.change(fileInput!, { target: { files: [csvFile] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const autocompleteInput = within(getGoldenQaAutocompleteRoot()).getByTestId('AutocompleteInput').querySelector('input')!;
      expect(autocompleteInput.value).toBe('my_dataset');
    });

    // Open the autocomplete and verify newly uploaded appears first
    await openGoldenQaAutocomplete();

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveTextContent('my_dataset');
    });
  });

  test('when there is an existing golden QA the new uploaded golden QA is pushed to the top and becomes the selected option', async () => {
    render(
      wrapper([
        ...defaultMocks,
        createGoldenQaCustomSuccessMock('first_qa', 1, '100'),
        createGoldenQaCustomSuccessMock('second_qa', 1, '200'),
      ])
    );

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    // First upload: first_qa.csv
    fireEvent.click(screen.getByRole('button', { name: 'Upload Golden QA' }));
    let fileInput = document.querySelector('input[type="file"][accept=".csv"]');
    fireEvent.change(fileInput!, {
      target: { files: [new File(['Q,A'], 'first_qa.csv', { type: 'text/csv' })] },
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
      const input = within(getGoldenQaAutocompleteRoot()).getByTestId('AutocompleteInput').querySelector('input')!;
      expect(input.value).toBe('first_qa');
    });

    // Second upload: second_qa.csv (should appear at top and be selected)
    fireEvent.click(screen.getByRole('button', { name: 'Upload Golden QA' }));
    fileInput = document.querySelector('input[type="file"][accept=".csv"]');
    fireEvent.change(fileInput!, {
      target: { files: [new File(['Q,A'], 'second_qa.csv', { type: 'text/csv' })] },
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const input = within(getGoldenQaAutocompleteRoot()).getByTestId('AutocompleteInput').querySelector('input')!;
      expect(input.value).toBe('second_qa');
    });

    // Open the autocomplete and verify second_qa is first
    await openGoldenQaAutocomplete();

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveTextContent('second_qa');
      expect(options[1]).toHaveTextContent('first_qa');
    });
  });
});
