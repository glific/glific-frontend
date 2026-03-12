import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { useMutation } from '@apollo/client';
import { setErrorMessage, setNotification } from 'common/notification';

import { CREATE_GOLDEN_QA, UploadGoldenQaDialog } from './UploadGoldenQaDialog';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
    setErrorMessage: vi.fn(),
  };
});

vi.mock('@apollo/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@apollo/client')>();
  return {
    ...mod,
    useMutation: vi.fn((...args: any[]) => (mod as any).useMutation(...args)),
  };
});

const createGoldenQaSuccessMock = {
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  result: {
    data: {
      createGoldenQa: {
        __typename: 'CreateGoldenQaPayload',
        goldenQa: { __typename: 'GoldenQa', name: 'golden_qa', duplication_factor: 1 },
        errors: null,
      },
    },
  },
};

const createGoldenQaErrorMock = {
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  result: {
    data: {
      createGoldenQa: {
        __typename: 'CreateGoldenQaPayload',
        goldenQa: null,
        errors: [{ __typename: 'Error', message: 'Name already exists', key: 'name' }],
      },
    },
  },
};

const createGoldenQaNetworkErrorMock = {
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  error: new Error('Network error'),
};

const defaultProps = {
  open: true,
  fileName: 'golden-qa.csv',
  file: new File(['Question,Answer\nq1,a1'], 'golden-qa.csv', { type: 'text/csv' }),
  onClose: vi.fn(),
  onProceed: vi.fn(),
};

const wrapper = (mocks: any[] = [createGoldenQaSuccessMock]) => (
  <MockedProvider mocks={mocks}>
    <UploadGoldenQaDialog {...defaultProps} />
  </MockedProvider>
);

describe('UploadGoldenQaDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders dialog when open with title, file name, and form fields', () => {
    render(wrapper());

    expect(screen.getByTestId('dialogTitle')).toHaveTextContent('Upload Golden QA');
    expect(screen.getByText('golden-qa.csv')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name your Golden QA collection')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Duplication Factor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'No of times the golden questions are repeated while running the evaluation. Allowed values 1-5.'
      )
    ).toBeInTheDocument();
  });

  test('does not show dialog content when open is false', () => {
    render(
      <MockedProvider mocks={[]}>
        <UploadGoldenQaDialog {...defaultProps} open={false} />
      </MockedProvider>
    );

    expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
    expect(screen.queryByText('Upload Golden QA')).not.toBeInTheDocument();
  });

  test('defaults name from fileName by sanitizing (hyphens to underscores, strip invalid chars)', () => {
    render(wrapper());

    const nameInput = screen.getByPlaceholderText('Name your Golden QA collection');
    expect((nameInput as HTMLInputElement).value).toBe('golden_qa');
  });

  test('defaults name for fileName with special characters', () => {
    render(
      <MockedProvider mocks={[]}>
        <UploadGoldenQaDialog {...defaultProps} fileName="my-file-name.csv" />
      </MockedProvider>
    );

    const nameInput = screen.getByPlaceholderText('Name your Golden QA collection');
    expect((nameInput as HTMLInputElement).value).toBe('my_file_name');
  });

  test('defaults duplication factor to 1', () => {
    render(wrapper());

    const dupInput = screen.getByPlaceholderText('1');
    expect((dupInput as HTMLInputElement).value).toBe('1');
  });

  test('shows validation error when name is empty on submit', async () => {
    render(wrapper());

    const nameInput = screen.getByPlaceholderText('Name your Golden QA collection');
    await userEvent.clear(nameInput);
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  test.each(['invalid name with spaces', 'invalid-name-with-hyphens', 'invalid.name.with.dots', 'InvalidNameWithUpperCase'])(
    'shows validation error when name has invalid characters: "%s"',
    async (input) => {
      render(wrapper());

      const nameInput = screen.getByPlaceholderText('Name your Golden QA collection');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, input);
      fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

      await waitFor(() => {
        expect(screen.getByText('Name can only contain lowercase alphanumeric characters and underscores')).toBeInTheDocument();
      });
    }
  );

  test('shows validation error when duplication factor is less than 1', async () => {
    render(wrapper());

    const dupInput = screen.getByPlaceholderText('1');
    await userEvent.clear(dupInput);
    await userEvent.type(dupInput, '0');
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.getByText('Duplication factor must be between 1 and 5')).toBeInTheDocument();
    });
  });

  test('shows validation error when duplication factor is greater than 5', async () => {
    render(wrapper());

    const dupInput = screen.getByPlaceholderText('1');
    await userEvent.clear(dupInput);
    await userEvent.type(dupInput, '6');
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.getByText('Duplication factor must be between 1 and 5')).toBeInTheDocument();
    });
  });

  test('shows validation error when duplication factor is not a number', async () => {
    render(wrapper());

    const dupInput = screen.getByPlaceholderText('1');
    await userEvent.clear(dupInput);
    await userEvent.type(dupInput, 'x');
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      const duplicationError =
        screen.queryByText('Duplication factor must be a number') ||
        screen.queryByText('Duplication factor is required') ||
        screen.queryByText('Duplication factor must be between 1 and 5');
      expect(duplicationError).toBeInTheDocument();
    });
  });

  test('Cancel button calls onClose', () => {
    const onClose = vi.fn();
    render(
      <MockedProvider mocks={[]}>
        <UploadGoldenQaDialog {...defaultProps} onClose={onClose} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('on successful upload calls onProceed and setNotification', async () => {
    const onProceed = vi.fn();
    render(
      <MockedProvider mocks={[createGoldenQaSuccessMock]}>
        <UploadGoldenQaDialog {...defaultProps} onProceed={onProceed} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('Golden QA uploaded successfully', 'success');
    });
    expect(onProceed).toHaveBeenCalledWith({
      name: 'golden_qa',
      duplicationFactor: 1,
    });
  });

  test('on successful upload with custom name and duplication factor calls onProceed with those values', async () => {
    const onProceed = vi.fn();
    const customMock = {
      request: { query: CREATE_GOLDEN_QA },
      variableMatcher: () => true,
      result: {
        data: {
          createGoldenQa: {
            __typename: 'CreateGoldenQaPayload',
            goldenQa: { __typename: 'GoldenQa', name: 'my_custom_name', duplication_factor: 3 },
            errors: null,
          },
        },
      },
    };
    render(
      <MockedProvider mocks={[customMock]}>
        <UploadGoldenQaDialog {...defaultProps} onProceed={onProceed} />
      </MockedProvider>
    );

    const nameInput = screen.getByPlaceholderText('Name your Golden QA collection');
    const dupInput = screen.getByPlaceholderText('1');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'my_custom_name');
    await userEvent.clear(dupInput);
    await userEvent.type(dupInput, '3');

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(onProceed).toHaveBeenCalledWith({
        name: 'my_custom_name',
        duplicationFactor: 3,
      });
    });
  });

  test('when file is null shows error notification and does not call mutation or onProceed', async () => {
    const onProceed = vi.fn();
    render(
      <MockedProvider mocks={[createGoldenQaSuccessMock]}>
        <UploadGoldenQaDialog {...defaultProps} file={null} onProceed={onProceed} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('No file selected for Golden QA upload', 'error');
    });
    expect(onProceed).not.toHaveBeenCalled();
  });

  test('when API returns errors shows error notification and does not call onProceed', async () => {
    const onProceed = vi.fn();
    render(
      <MockedProvider mocks={[createGoldenQaErrorMock]}>
        <UploadGoldenQaDialog {...defaultProps} onProceed={onProceed} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('Name already exists', 'error');
    });
    expect(onProceed).not.toHaveBeenCalled();
  });

  test('when API returns errors with no message shows fallback error notification', async () => {
    const noMessageMock = {
      request: { query: CREATE_GOLDEN_QA },
      variableMatcher: () => true,
      result: {
        data: {
          createGoldenQa: {
            __typename: 'CreateGoldenQaPayload',
            goldenQa: null,
            errors: [{ __typename: 'Error', message: null, key: 'unknown' }],
          },
        },
      },
    };
    render(
      <MockedProvider mocks={[noMessageMock]}>
        <UploadGoldenQaDialog {...defaultProps} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalledWith('Failed to upload Golden QA', 'error');
    });
  });

  test('when mutation throws calls setErrorMessage', async () => {
    render(
      <MockedProvider mocks={[createGoldenQaNetworkErrorMock]}>
        <UploadGoldenQaDialog {...defaultProps} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(setErrorMessage).toHaveBeenCalled();
    });
  });

  test('Upload button is disabled while mutation is in flight', () => {
    vi.mocked(useMutation).mockReturnValueOnce([
      vi.fn(),
      { loading: true, data: undefined, error: undefined, called: false, reset: vi.fn() },
    ] as any);

    render(
      <MockedProvider mocks={[createGoldenQaSuccessMock]}>
        <UploadGoldenQaDialog {...defaultProps} />
      </MockedProvider>
    );

    expect(screen.getByTestId('ok-button')).toBeDisabled();
    expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument();
  });
});
