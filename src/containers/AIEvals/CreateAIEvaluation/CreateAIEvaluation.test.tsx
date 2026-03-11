import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import { CreateAIEvaluation, DUMMY_CREATE, DUMMY_GET_ITEM } from './CreateAIEvaluation';

// Mock UploadGoldenQaDialog so we can trigger onProceed without running the real mutation (which sends a File and is hard to mock in Apollo).
vi.mock('./UploadGoldenQaDialog', () => ({
  UploadGoldenQaDialog: ({
    open,
    fileName,
    onClose,
    onProceed,
  }: {
    open: boolean;
    fileName: string;
    onClose: () => void;
    onProceed: (v: { name: string; duplicationFactor: number }) => void;
  }) => {
    if (!open) return null;
    const name = fileName
      .split('.')[0]
      .replace(/-/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');
    return (
      <div data-testid="dialogBox">
        <div data-testid="dialogTitle">Upload Golden QA</div>
        <div>{fileName}</div>
        <button type="button" onClick={() => onProceed({ name, duplicationFactor: 1 })}>
          Upload
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    );
  },
  CREATE_GOLDEN_QA: {},
}));

const dummyGetItemMock = {
  request: { query: DUMMY_GET_ITEM },
  result: { data: { __typename: 'Query' } },
};

const dummyCreateMock = {
  request: { query: DUMMY_CREATE },
  result: { data: { __typename: 'Mutation' } },
};

const defaultMocks = [dummyGetItemMock, dummyCreateMock];

const wrapper = (mocks: any[] = defaultMocks) => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter initialEntries={['/ai-evaluations/create']}>
      <Routes>
        <Route path="/ai-evaluations/create" element={<CreateAIEvaluation />} />
        <Route path="/ai-evaluations" element={<div>AI Evaluations List</div>} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

describe('CreateAIEvaluation', () => {
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
  });

  test('shows No Golden QA available when no datasets are uploaded', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    expect(screen.getByText('No Golden QA available, upload one first')).toBeInTheDocument();
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
    expect(screen.getByText('Question,Answer')).toBeInTheDocument();
    expect(screen.getByText('What is the capital of France?,Paris')).toBeInTheDocument();
    expect(screen.getByText('Click here for the template CSV')).toBeInTheDocument();
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
      // Dialog shows file name (e.g. golden-qa.csv) and name field defaults to sanitized name (golden_qa)
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
      expect(screen.getByPlaceholderText('Give a unique name for the evaluation experiment.')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Give a unique name for the evaluation experiment.');
    fireEvent.change(nameInput, { target: { value: 'valid_name' } });
    fireEvent.click(screen.getByText('Run Evaluation'));

    await waitFor(() => {
      expect(screen.getByText('Please select an AI Assistant')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid evaluation name pattern', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Give a unique name for the evaluation experiment.')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Give a unique name for the evaluation experiment.');
    fireEvent.change(nameInput, { target: { value: 'invalid name with spaces' } });
    fireEvent.click(screen.getByText('Run Evaluation'));

    await waitFor(() => {
      expect(screen.getByText('Invalid evaluation name')).toBeInTheDocument();
    });
  });

  test('accepts valid evaluation name with alphanumeric, underscore and hyphen', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Give a unique name for the evaluation experiment.')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Give a unique name for the evaluation experiment.');
    fireEvent.change(nameInput, { target: { value: 'valid_evaluation-name123' } });

    expect((nameInput as HTMLInputElement).value).toBe('valid_evaluation-name123');
  });

  test('shows assistant helper text', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('Create AI Evaluation')).toBeInTheDocument();
    });

    expect(screen.getByText("This list includes all assistants and versions you've created.")).toBeInTheDocument();
  });

  test('Run Evaluation submit button is visible and enabled', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByTestId('submitActionButton')).toBeInTheDocument();
      expect(screen.getByTestId('submitActionButton')).toHaveTextContent('Run Evaluation');
      expect(screen.getByTestId('submitActionButton')).not.toBeDisabled();
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

  test('after uploading golden QA the dropdown updates to set the file uploaded as the selected option', async () => {
    render(wrapper());

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
      // Dropdown shows the uploaded dataset as the selected option
      expect(screen.getByText('golden_qa')).toBeInTheDocument();
    });
  });

  test('when there is no existing file, the default option is removed after upload', async () => {
    render(wrapper());

    await waitFor(() => {
      expect(screen.getByText('No Golden QA available, upload one first')).toBeInTheDocument();
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
      expect(screen.queryByText('No Golden QA available, upload one first')).not.toBeInTheDocument();
      expect(screen.getByText('my_dataset')).toBeInTheDocument();
    });
  });

  test('when there is an existing golden QA the new uploaded golden QA is pushed to the top and becomes the selected option', async () => {
    render(wrapper());

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
      expect(screen.getByText('first_qa')).toBeInTheDocument();
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

    // New upload is selected (displayed in the closed Select)
    await waitFor(() => {
      expect(screen.getByText('second_qa')).toBeInTheDocument();
    });

    // Open Golden QA dropdown (first dropdown on the form) and assert new upload is first (top) and both options exist
    const dropdowns = screen.getAllByTestId('dropdown');
    const goldenQaDropdown = dropdowns[0];
    const selectTrigger =
      goldenQaDropdown.querySelector('[role="combobox"]') ?? goldenQaDropdown.querySelector('button');
    fireEvent.mouseDown(selectTrigger!);

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(2);
      expect(options[0]).toHaveTextContent('second_qa');
      expect(options[1]).toHaveTextContent('first_qa');
    });
  });
});
