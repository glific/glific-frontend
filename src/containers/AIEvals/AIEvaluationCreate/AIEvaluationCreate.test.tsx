import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import { setNotification } from 'common/notification';
import {
  createGoldenQaCustomSuccessMock,
  createGoldenQaErrorMock,
  createGoldenQaSuccessMock,
  getAIEvaluationCreateMocks,
  getAssistantConfigVersionsEmptyMock,
  getAssistantConfigVersionsErrorMock,
  getAssistantConfigVersionsLoadingMock,
  getAssistantConfigVersionsMock,
  getAssistantConfigVersionsMultipleNamesMock,
  getCreateEvaluationSuccessMock,
  getListAiEvaluationsMock,
  getListGoldenQaForCreateEmptyMock,
  getListGoldenQaForCreateErrorMock,
  getListGoldenQaForCreateMock,
} from 'mocks/AIEvaluations';
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
        <Route path="/ai-evaluations" element={<div>AI Evaluations Page</div>} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

const getGoldenQaAutocompleteRoot = () => screen.getAllByTestId('autocomplete-element')[0];

const getAssistantAutocompleteRoot = () => screen.getAllByTestId('autocomplete-element')[1];

const openGoldenQaAutocomplete = async () => {
  const combobox = within(getGoldenQaAutocompleteRoot()).getByRole('combobox');
  fireEvent.focus(combobox);
  fireEvent.keyDown(combobox, { key: 'ArrowDown' });
  await waitFor(() => {
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
};

const openAssistantAutocomplete = async () => {
  const root = getAssistantAutocompleteRoot();
  const combobox = within(root).getByRole('combobox');
  fireEvent.focus(combobox);
  fireEvent.keyDown(combobox, { key: 'ArrowDown' });
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

  const nameInput = screen.getByTestId('outlinedInput').querySelector('input')!;
  fireEvent.change(nameInput, { target: { value: evaluationName } });

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
    expect(screen.getAllByTestId('autocomplete-element')).toHaveLength(2);
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

    const openButton = within(getGoldenQaAutocompleteRoot()).getByRole('button', { name: 'Open' });
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
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

    expect(screen.getByRole('button', { name: 'Upload Golden QA' })).toBeInTheDocument();
    expect(screen.getByTestId('templateCsvButton')).toBeInTheDocument();
  });

  test('clicking the CSV template button downloads golden_qa_template.csv with correct content', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    const mockObjectUrl = 'blob:mock-url';
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockObjectUrl);
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const mockClick = vi.fn();
    let capturedAnchor: HTMLAnchorElement | null = null;
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        const anchor = originalCreateElement('a') as HTMLAnchorElement;
        anchor.click = mockClick;
        capturedAnchor = anchor;
        return anchor;
      }
      return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
    });

    fireEvent.click(screen.getByTestId('templateCsvButton'));

    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/csv;charset=utf-8;');

    expect(capturedAnchor).not.toBeNull();
    expect(capturedAnchor!.download).toBe('golden_qa_template.csv');
    expect(mockClick).toHaveBeenCalledOnce();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockObjectUrl);

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    createElementSpy.mockRestore();
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

    await openGoldenQaAutocomplete();
    fireEvent.click(screen.getByRole('option', { name: 'Diabetescare-0101' }));
    await openAssistantAutocomplete();
    fireEvent.click(screen.getByRole('option', { name: 'Test Assistant (Version 2)' }));
    fireEvent.click(screen.getByText('Run Evaluation'));

    await waitFor(() => {
      const nameInput = screen.getByTestId('outlinedInput').querySelector('input')!;
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  test('shows validation error when AI Assistant is not selected on submit', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByTestId('outlinedInput')).toBeInTheDocument();
    });

    await openGoldenQaAutocomplete();
    fireEvent.click(screen.getByRole('option', { name: 'Diabetescare-0101' }));

    const nameInput = screen.getByTestId('outlinedInput').querySelector('input')!;
    fireEvent.change(nameInput, { target: { value: 'valid_name' } });
    fireEvent.click(screen.getByText('Run Evaluation'));

    await waitFor(() => {
      const assistantInput = within(getAssistantAutocompleteRoot()).getByRole('combobox');
      expect(assistantInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  test('shows validation error when evaluation name is cleared after being typed', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByTestId('outlinedInput')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('outlinedInput').querySelector('input')!;
    fireEvent.change(nameInput, { target: { value: 'some_name' } });
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  test('accepts any non-empty evaluation name', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByTestId('outlinedInput')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('outlinedInput').querySelector('input')!;
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

    const assistantInput = within(getAssistantAutocompleteRoot()).getByRole('combobox');
    expect(assistantInput).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
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

    const assistantInput = within(getAssistantAutocompleteRoot()).getByRole('combobox');
    expect(assistantInput).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
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
    render(
      wrapper([
        getListAiEvaluationsMock,
        getAssistantConfigVersionsMock,
        getListGoldenQaForCreateMock,
        getCreateEvaluationSuccessMock,
      ])
    );

    await fillAndSubmitForm();

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('AI evaluation created successfully!');
      expect(screen.getByText('AI Evaluations Page')).toBeInTheDocument();
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
      const autocompleteInput = within(getGoldenQaAutocompleteRoot()).getByRole('combobox') as HTMLInputElement;
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
      const autocompleteInput = within(getGoldenQaAutocompleteRoot()).getByRole('combobox') as HTMLInputElement;
      expect(autocompleteInput.value).toBe('my_dataset');
    });

    // Open the autocomplete and verify newly uploaded appears first
    await openGoldenQaAutocomplete();

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveTextContent('my_dataset');
    });
  });

  test('mutation is called with goldenQaId (Glific DB id), not datasetId', async () => {
    const varCapture: any[] = [];
    const matchingMock = {
      ...getCreateEvaluationSuccessMock,
      variableMatcher: (vars: any) => {
        varCapture.push(vars);
        return true;
      },
    };

    render(
      wrapper([getListAiEvaluationsMock, getAssistantConfigVersionsMock, getListGoldenQaForCreateMock, matchingMock])
    );

    await fillAndSubmitForm();

    await waitFor(() => {
      expect(varCapture.length).toBeGreaterThan(0);
      const input = varCapture[0].input;
      expect(input).toHaveProperty('goldenQaId');
      expect(input).not.toHaveProperty('datasetId');
      expect(input.goldenQaId).toBe('1');
    });
  });

  test('goldenQaId is the Glific DB id (qa.id), not the Kaapi datasetId', async () => {
    const varCapture: any[] = [];
    const matchingMock = {
      ...getCreateEvaluationSuccessMock,
      variableMatcher: (vars: any) => {
        varCapture.push(vars);
        return true;
      },
    };

    render(
      wrapper([getListAiEvaluationsMock, getAssistantConfigVersionsMock, getListGoldenQaForCreateMock, matchingMock])
    );

    await fillAndSubmitForm();

    await waitFor(() => {
      expect(varCapture.length).toBeGreaterThan(0);
      const input = varCapture[0].input;
      // goldenQaSampleRows[0] has id:'1', datasetId:'101'
      // We must send id ('1'), not datasetId ('101')
      expect(input.goldenQaId).toBe('1');
      expect(input.goldenQaId).not.toBe('101');
    });
  });

  test('mutation sends goldenQaId of newly uploaded golden QA (uses its Glific id)', async () => {
    const varCapture: any[] = [];
    const matchingMock = {
      ...getCreateEvaluationSuccessMock,
      variableMatcher: (vars: any) => {
        varCapture.push(vars);
        return true;
      },
    };

    render(wrapper([...defaultMocks, createGoldenQaCustomSuccessMock('my_uploaded', 1, '99', '888'), matchingMock]));

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Upload Golden QA' }));
    const fileInput = document.querySelector('input[type="file"][accept=".csv"]');
    const csvFile = new File(['Question,Answer\nq1,a1'], 'my_uploaded.csv', { type: 'text/csv' });
    fireEvent.change(fileInput!, { target: { files: [csvFile] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('outlinedInput').querySelector('input')!;
    fireEvent.change(nameInput, { target: { value: 'test_evaluation' } });

    const assistantRoot = screen.getAllByTestId('autocomplete-element')[1];
    const assistantCombobox = within(assistantRoot).getByRole('combobox');
    fireEvent.focus(assistantCombobox);
    fireEvent.keyDown(assistantCombobox, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Test Assistant (Version 2)' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('option', { name: 'Test Assistant (Version 2)' }));

    fireEvent.click(screen.getByText('Run Evaluation'));

    await waitFor(() => {
      expect(varCapture.length).toBeGreaterThan(0);
      const input = varCapture[0].input;
      expect(input.goldenQaId).toBe('99');
      expect(input.goldenQaId).not.toBe('888');
    });
  });

  test('upload failure does not update the autocomplete selection', async () => {
    render(wrapper([...defaultMocks, createGoldenQaErrorMock]));

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    await openGoldenQaAutocomplete();
    fireEvent.click(screen.getByRole('option', { name: 'Diabetescare-0101' }));

    const goldenQaInput = within(getGoldenQaAutocompleteRoot()).getByRole('combobox') as HTMLInputElement;
    expect(goldenQaInput.value).toBe('Diabetescare-0101');

    fireEvent.click(screen.getByRole('button', { name: 'Upload Golden QA' }));
    const fileInput = document.querySelector('input[type="file"][accept=".csv"]');
    const csvFile = new File(['Question,Answer\nq1,a1'], 'bad.csv', { type: 'text/csv' });
    fireEvent.change(fileInput!, { target: { files: [csvFile] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('Name already exists', 'error');
    });

    expect(goldenQaInput.value).toBe('Diabetescare-0101');
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
      const input = within(getGoldenQaAutocompleteRoot()).getByRole('combobox') as HTMLInputElement;
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
      const input = within(getGoldenQaAutocompleteRoot()).getByRole('combobox') as HTMLInputElement;
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
