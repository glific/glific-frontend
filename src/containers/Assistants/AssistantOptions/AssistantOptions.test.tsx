import { useMutation } from '@apollo/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import * as Notification from 'common/notification';
import { AssistantOptions } from './AssistantOptions';

vi.mock('@apollo/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@apollo/client')>();
  return {
    ...mod,
    useMutation: vi.fn(),
  };
});

const setNotificationSpy = vi.spyOn(Notification, 'setNotification');

const baseProps = {
  formikValues: {
    initialFiles: [],
    knowledgeBaseVersionId: '',
    knowledgeBaseName: '',
    temperature: 1,
  },
  setFieldValue: vi.fn(),
  formikErrors: {},
  formikTouched: {},
  knowledgeBaseId: 'kb-1',
  isLegacyVectorStore: false,
  onFilesChange: vi.fn(),
  vectorStoreId: 'vs-1',
  validateForm: vi.fn(),
  disabled: false,
};

const setupMutations = ({
  uploadImpl,
  createKnowledgeBaseImpl,
}: {
  uploadImpl?: any;
  createKnowledgeBaseImpl?: any;
} = {}) => {
  const uploadMutation = uploadImpl || vi.fn(() => Promise.resolve({}));
  const createKnowledgeBaseMutation = createKnowledgeBaseImpl || vi.fn(() => Promise.resolve({}));

  let useMutationCallCount = 0;
  vi.mocked(useMutation).mockImplementation(() => {
    if (useMutationCallCount % 2 === 0) {
      useMutationCallCount += 1;
      return [uploadMutation, { loading: false }] as any;
    }

    useMutationCallCount += 1;
    return [createKnowledgeBaseMutation, { loading: false }] as any;
  });

  return { uploadMutation, createKnowledgeBaseMutation };
};

const renderAssistantOptions = (props: Partial<Parameters<typeof AssistantOptions>[0]> = {}) =>
  render(<AssistantOptions {...baseProps} {...props} />);

describe('AssistantOptions upload queue behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('uploads at most 10 files concurrently and starts next queued file on completion', async () => {
    const uploadControllers: Record<
      string,
      { succeed: () => void; fail: (message?: string) => void; completed: boolean }
    > = {};

    const uploadMutation = vi.fn(({ variables, onCompleted, onError }) => {
      const fileName = variables.media.name as string;
      return new Promise((resolve) => {
        uploadControllers[fileName] = {
          completed: false,
          succeed: () => {
            if (uploadControllers[fileName].completed) return;
            uploadControllers[fileName].completed = true;
            onCompleted({
              uploadFilesearchFile: {
                fileId: `id-${fileName}`,
                filename: fileName,
                uploadedAt: '2026-01-01',
                fileSize: 12,
              },
            });
            resolve({});
          },
          fail: (message = 'upload failed') => {
            if (uploadControllers[fileName].completed) return;
            uploadControllers[fileName].completed = true;
            onError({ message });
            resolve({});
          },
        };
      });
    });

    setupMutations({ uploadImpl: uploadMutation });
    renderAssistantOptions();

    fireEvent.click(screen.getByTestId('addFiles'));

    const selectedFiles = Array.from({ length: 12 }, (_, index) => {
      return new File(['content'], `queue-file-${index}.txt`, { type: 'text/plain' });
    });

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: selectedFiles,
      },
    });

    await waitFor(() => {
      expect(uploadMutation).toHaveBeenCalledTimes(10);
      expect(screen.getAllByTestId('uploadingIcon')).toHaveLength(10);
      expect(screen.getAllByTestId('queuedIcon')).toHaveLength(2);
    });

    uploadControllers['queue-file-0.txt'].succeed();

    await waitFor(() => {
      expect(uploadMutation).toHaveBeenCalledTimes(11);
      expect(screen.getAllByTestId('uploadingIcon')).toHaveLength(10);
      expect(screen.getAllByTestId('queuedIcon')).toHaveLength(1);
    });
  });

  test('does not enqueue new uploads after closing dialog', async () => {
    const uploadControllers: Record<string, { succeed: () => void; completed: boolean }> = {};

    const uploadMutation = vi.fn(({ variables, onCompleted }) => {
      const fileName = variables.media.name as string;
      return new Promise((resolve) => {
        uploadControllers[fileName] = {
          completed: false,
          succeed: () => {
            if (uploadControllers[fileName].completed) return;
            uploadControllers[fileName].completed = true;
            onCompleted({
              uploadFilesearchFile: {
                fileId: `id-${fileName}`,
                filename: fileName,
                uploadedAt: '2026-01-01',
                fileSize: 12,
              },
            });
            resolve({});
          },
        };
      });
    });

    setupMutations({ uploadImpl: uploadMutation });
    renderAssistantOptions();
    fireEvent.click(screen.getByTestId('addFiles'));

    const selectedFiles = Array.from({ length: 12 }, (_, index) => {
      return new File(['content'], `cancel-file-${index}.txt`, { type: 'text/plain' });
    });

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: selectedFiles,
      },
    });

    await waitFor(() => {
      expect(uploadMutation).toHaveBeenCalledTimes(10);
    });

    fireEvent.click(screen.getByTestId('cancel-button'));
    uploadControllers['cancel-file-0.txt'].succeed();

    await waitFor(() => {
      expect(uploadMutation).toHaveBeenCalledTimes(10);
    });
  });

  test('orders file rows with queued first, then failed, and completed at the bottom', async () => {
    const uploadControllers: Record<string, { fail: (message?: string) => void }> = {};

    const uploadMutation = vi.fn(({ variables, onCompleted, onError }) => {
      const fileName = variables.media.name as string;
      return new Promise((resolve) => {
        uploadControllers[fileName] = {
          fail: (message = 'upload failed') => {
            onError({ message });
            resolve({});
          },
        };
      });
    });

    setupMutations({ uploadImpl: uploadMutation });

    renderAssistantOptions({
      formikValues: {
        ...baseProps.formikValues,
        initialFiles: [
          {
            fileId: 'existing-file-id',
            filename: 'existing-file.txt',
            uploadedAt: '2026-01-01',
            fileSize: 10,
          },
        ],
      },
    });

    fireEvent.click(screen.getByTestId('addFiles'));

    const selectedFiles = Array.from({ length: 12 }, (_, index) => {
      return new File(['content'], `order-file-${index}.txt`, { type: 'text/plain' });
    });

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: selectedFiles,
      },
    });

    await waitFor(() => {
      expect(uploadMutation).toHaveBeenCalledTimes(10);
      expect(screen.getAllByTestId('queuedIcon')).toHaveLength(2);
    });

    uploadControllers['order-file-1.txt'].fail('bad file');

    await waitFor(() => {
      expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
    });

    const fileRowsText = screen.getAllByTestId('fileItem').map((row) => row.textContent || '');
    const existingIndex = fileRowsText.findIndex((text) => text.includes('existing-file.txt'));
    const failedIndex = fileRowsText.findIndex((text) => text.includes('order-file-1.txt'));

    const queuedIndex = fileRowsText.findIndex((text) => text.includes('order-file-0.txt'));
    expect(queuedIndex).toBeGreaterThan(-1);
    expect(failedIndex).toBeGreaterThan(-1);
    expect(existingIndex).toBeGreaterThan(-1);
    expect(queuedIndex).toBeLessThan(failedIndex);
    expect(failedIndex).toBeLessThan(existingIndex);
  });

  test('does not allow deleting a file while file upload is in progress', async () => {
    const uploadMutation = vi.fn(() => new Promise(() => {}));
    setupMutations({ uploadImpl: uploadMutation });

    renderAssistantOptions();
    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'in-progress.txt', { type: 'text/plain' })],
      },
    });

    await waitFor(() => {
      expect(uploadMutation).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('deleteFile')).toBeDisabled();
    });

    fireEvent.click(screen.getByTestId('deleteFile'));
    expect(screen.getByText('in-progress.txt')).toBeInTheDocument();
  });

  test('allows deleting queued, failed and attached files', async () => {
    const uploadControllers: Record<
      string,
      { succeed: () => void; fail: (message?: string) => void; completed: boolean }
    > = {};

    const uploadMutation = vi.fn(({ variables, onCompleted, onError }) => {
      const fileName = variables.media.name as string;

      return new Promise((resolve) => {
        uploadControllers[fileName] = {
          completed: false,
          succeed: () => {
            if (uploadControllers[fileName].completed) return;
            uploadControllers[fileName].completed = true;
            onCompleted({
              uploadFilesearchFile: {
                fileId: `id-${fileName}`,
                filename: fileName,
                uploadedAt: '2026-01-01',
                fileSize: 12,
              },
            });
            resolve({});
          },
          fail: (message = 'upload failed') => {
            if (uploadControllers[fileName].completed) return;
            uploadControllers[fileName].completed = true;
            onError({ message });
            resolve({});
          },
        };
      });
    });

    setupMutations({ uploadImpl: uploadMutation });
    renderAssistantOptions();
    fireEvent.click(screen.getByTestId('addFiles'));

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: Array.from({ length: 12 }, (_, index) => new File(['content'], `state-file-${index}.txt`)),
      },
    });

    await waitFor(() => {
      expect(uploadMutation).toHaveBeenCalledTimes(10);
      expect(screen.getAllByTestId('queuedIcon')).toHaveLength(2);
    });

    fireEvent.click(
      screen
        .getByText('state-file-10.txt')
        .closest('[data-testid="fileItem"]')!
        .querySelector('[data-testid="deleteFile"]')!
    );

    await waitFor(() => {
      expect(screen.queryByText('state-file-10.txt')).not.toBeInTheDocument();
    });

    uploadControllers['state-file-0.txt'].succeed();
    uploadControllers['state-file-1.txt'].fail('bad file');

    await waitFor(() => {
      expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
      expect(screen.getByText('state-file-0.txt')).toBeInTheDocument();
    });

    fireEvent.click(
      screen
        .getByText('state-file-1.txt')
        .closest('[data-testid="fileItem"]')!
        .querySelector('[data-testid="deleteFile"]')!
    );
    expect(screen.queryByText('state-file-1.txt')).not.toBeInTheDocument();

    fireEvent.click(
      screen
        .getByText('state-file-0.txt')
        .closest('[data-testid="fileItem"]')!
        .querySelector('[data-testid="deleteFile"]')!
    );
    expect(screen.queryByText('state-file-0.txt')).not.toBeInTheDocument();
  });

  test('shows warning notification on save when files have failed uploads', async () => {
    const uploadMutation = vi.fn(({ onError }) => {
      onError({ message: 'Upload failed due to invalid content' });
      return Promise.resolve({});
    });
    const createKnowledgeBaseMutation = vi.fn(() => Promise.resolve({}));
    setupMutations({ uploadImpl: uploadMutation, createKnowledgeBaseImpl: createKnowledgeBaseMutation });

    renderAssistantOptions();
    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'bad-file.txt', { type: 'text/plain' })],
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
      expect(setNotificationSpy).toHaveBeenCalledWith(
        'Some file uploads failed, hover the failure to see the reason',
        'warning'
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(setNotificationSpy).toHaveBeenCalledWith('Remove or re-upload files that failed before saving.', 'warning');
    });
    expect(createKnowledgeBaseMutation).not.toHaveBeenCalled();
  });

  test('allows retrying a failed file while another upload is still in progress', async () => {
    const uploadMutation = vi.fn(({ variables, onCompleted, onError }) => {
      const fileName = variables.media.name as string;

      if (fileName === 'stuck-upload.txt') {
        return new Promise(() => {});
      }

      if (fileName === 'retry-failed.txt') {
        onError({ message: 'temporary failure' });
        return Promise.resolve({});
      }

      if (fileName === 'retry-success.txt') {
        onCompleted({
          uploadFilesearchFile: {
            fileId: `id-${fileName}`,
            filename: fileName,
            uploadedAt: '2026-01-01',
            fileSize: 12,
          },
        });
        return Promise.resolve({});
      }

      return Promise.resolve({});
    });

    setupMutations({ uploadImpl: uploadMutation });
    renderAssistantOptions();
    fireEvent.click(screen.getByTestId('addFiles'));

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [
          new File(['content'], 'stuck-upload.txt', { type: 'text/plain' }),
          new File(['content'], 'retry-failed.txt', { type: 'text/plain' }),
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
      expect(screen.getByTestId('retryFile')).toBeEnabled();
    });

    fireEvent.click(screen.getByTestId('retryFile'));

    await waitFor(() => {
      expect(uploadMutation).toHaveBeenCalledTimes(3);
    });
  });
});
