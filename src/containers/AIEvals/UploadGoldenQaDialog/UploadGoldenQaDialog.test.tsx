import { useMutation } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import * as Notification from 'common/notification';
import {
  createGoldenQaCustomSuccessMock,
  createGoldenQaErrorMock,
  createGoldenQaNetworkErrorMock,
  createGoldenQaNoMessageErrorMock,
  createGoldenQaSuccessMock,
} from 'mocks/AIEvaluations';
import { UploadGoldenQaDialog } from './UploadGoldenQaDialog';

const notificationSpy = vi.spyOn(Notification, 'setNotification');
const errorMessageSpy = vi.spyOn(Notification, 'setErrorMessage');

vi.mock('@apollo/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@apollo/client')>();
  return {
    ...mod,
    useMutation: vi.fn((...args: any[]) => (mod as any).useMutation(...args)),
  };
});

const defaultProps = {
  open: true,
  fileName: 'golden-qa.csv',
  file: new File(['Question,Answer\nq1,a1'], 'golden-qa.csv', { type: 'text/csv' }),
  onClose: vi.fn(),
  onProceed: vi.fn(),
};

const uploadGoldenQaDialogComponent = ({
  mocks = [createGoldenQaSuccessMock],
  props = {},
}: {
  mocks?: any[];
  props?: Partial<Parameters<typeof UploadGoldenQaDialog>[0]>;
} = {}) => (
  <MockedProvider mocks={mocks}>
    <UploadGoldenQaDialog {...defaultProps} {...props} />
  </MockedProvider>
);

describe('UploadGoldenQaDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders dialog when open with title, file name, and form fields', () => {
    render(uploadGoldenQaDialogComponent());

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
    render(uploadGoldenQaDialogComponent({ mocks: [], props: { open: false } }));

    expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
    expect(screen.queryByText('Upload Golden QA')).not.toBeInTheDocument();
  });

  test('defaults name from fileName by sanitizing (hyphens to underscores, strip invalid chars)', () => {
    render(uploadGoldenQaDialogComponent());

    const nameInput = screen.getByPlaceholderText('Name your Golden QA collection');
    expect((nameInput as HTMLInputElement).value).toBe('golden_qa');
  });

  test('defaults name for fileName with special characters', () => {
    render(uploadGoldenQaDialogComponent({ mocks: [], props: { fileName: 'my-file-name.csv' } }));

    const nameInput = screen.getByPlaceholderText('Name your Golden QA collection');
    expect((nameInput as HTMLInputElement).value).toBe('my_file_name');
  });

  test('defaults duplication factor to 1', () => {
    render(uploadGoldenQaDialogComponent());

    const dupInput = screen.getByPlaceholderText('1');
    expect((dupInput as HTMLInputElement).value).toBe('1');
  });

  test('shows validation error when name is empty on submit', async () => {
    render(uploadGoldenQaDialogComponent());

    const nameInput = screen.getByPlaceholderText('Name your Golden QA collection');
    await userEvent.clear(nameInput);
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  test.each([
    'invalid name with spaces',
    'invalid-name-with-hyphens',
    'invalid.name.with.dots',
    'InvalidNameWithUpperCase',
  ])('shows validation error when name has invalid characters: "%s"', async (input) => {
    render(uploadGoldenQaDialogComponent());

    const nameInput = screen.getByPlaceholderText('Name your Golden QA collection');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, input);
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(
        screen.getByText('Name can only contain lowercase alphanumeric characters and underscores')
      ).toBeInTheDocument();
    });
  });

  test('shows validation error when duplication factor is less than 1', async () => {
    render(uploadGoldenQaDialogComponent());

    const dupInput = screen.getByPlaceholderText('1');
    await userEvent.clear(dupInput);
    await userEvent.type(dupInput, '0');
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.getByText('Duplication factor must be between 1 and 5')).toBeInTheDocument();
    });
  });

  test('shows validation error when duplication factor is greater than 5', async () => {
    render(uploadGoldenQaDialogComponent());

    const dupInput = screen.getByPlaceholderText('1');
    await userEvent.clear(dupInput);
    await userEvent.type(dupInput, '6');
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(screen.getByText('Duplication factor must be between 1 and 5')).toBeInTheDocument();
    });
  });

  test('shows validation error when duplication factor is not a number', async () => {
    render(uploadGoldenQaDialogComponent());

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
    render(uploadGoldenQaDialogComponent({ mocks: [], props: { onClose } }));

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('on successful upload calls onProceed and setNotification', async () => {
    const onProceed = vi.fn();
    render(uploadGoldenQaDialogComponent({ mocks: [createGoldenQaSuccessMock], props: { onProceed } }));

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Golden QA uploaded successfully', 'success');
    });
    expect(onProceed).toHaveBeenCalledWith({
      datasetId: 123,
      name: 'golden_qa',
      duplicationFactor: 1,
    });
  });

  test('on successful upload with custom name and duplication factor calls onProceed with those values', async () => {
    const onProceed = vi.fn();
    render(
      uploadGoldenQaDialogComponent({
        mocks: [createGoldenQaCustomSuccessMock('my_custom_name', 3)],
        props: { onProceed },
      })
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
        datasetId: 456,
        name: 'my_custom_name',
        duplicationFactor: 3,
      });
    });
  });

  test('when file is null shows error notification and does not call mutation or onProceed', async () => {
    const onProceed = vi.fn();
    render(uploadGoldenQaDialogComponent({ mocks: [createGoldenQaSuccessMock], props: { file: null, onProceed } }));

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('No file selected for Golden QA upload', 'error');
    });
    expect(onProceed).not.toHaveBeenCalled();
  });

  test('when API returns errors shows error notification and does not call onProceed', async () => {
    const onProceed = vi.fn();
    render(uploadGoldenQaDialogComponent({ mocks: [createGoldenQaErrorMock], props: { onProceed } }));

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Name already exists', 'error');
    });
    expect(onProceed).not.toHaveBeenCalled();
  });

  test('when API returns errors with no message shows fallback error notification', async () => {
    render(uploadGoldenQaDialogComponent({ mocks: [createGoldenQaNoMessageErrorMock] }));

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Failed to upload Golden QA', 'error');
    });
  });

  test('when mutation throws calls setErrorMessage', async () => {
    render(uploadGoldenQaDialogComponent({ mocks: [createGoldenQaNetworkErrorMock] }));

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => {
      expect(errorMessageSpy).toHaveBeenCalled();
    });
  });

  test('Upload button is disabled while mutation is in flight', () => {
    vi.mocked(useMutation).mockReturnValueOnce([
      vi.fn(),
      { loading: true, data: undefined, error: undefined, called: false, reset: vi.fn() },
    ] as any);

    render(uploadGoldenQaDialogComponent({ mocks: [createGoldenQaSuccessMock] }));

    expect(screen.getByTestId('ok-button')).toBeDisabled();
    expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument();
  });
});
