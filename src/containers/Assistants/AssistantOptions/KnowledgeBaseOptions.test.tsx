import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { KnowledgeBaseOptions } from './KnowledgeBaseOptions';

import * as Notification from 'common/notification';
import { CREATE_KNOWLEDGE_BASE, UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';
import {
  knowledgeBaseOptionsBaseProps,
  createUploadSuccessMock,
  createUploadErrorMock,
  rateLimitError,
} from 'mocks/KnowledgeBase';

const setNotificationSpy = vi.spyOn(Notification, 'setNotification');

const baseProps = {
  ...knowledgeBaseOptionsBaseProps,
  setFieldValue: vi.fn(),
  onFilesChange: vi.fn(),
  validateForm: vi.fn(),
};

const renderKnowledgeBaseOptions = (props = baseProps, mocks: any[] = []) =>
  render(
    <MockedProvider mocks={mocks}>
      <KnowledgeBaseOptions {...props} />
    </MockedProvider>
  );

describe('KnowledgeBaseOptions', () => {
  test('shows Manage Knowledge Base dialog title when opened', async () => {
    renderKnowledgeBaseOptions();

    fireEvent.click(screen.getByTestId('addFiles'));

    await waitFor(() => {
      expect(screen.getByText('Manage Knowledge Base')).toBeInTheDocument();
    });
  });

  test('shows dialog subtitle when not a legacy vector store', async () => {
    renderKnowledgeBaseOptions();

    fireEvent.click(screen.getByTestId('addFiles'));

    await waitFor(() => {
      expect(
        screen.getByText('You are adding more files to existing Knowledge Base')
      ).toBeInTheDocument();
    });
  });

  test('shows Proceed button in dialog', async () => {
    renderKnowledgeBaseOptions();

    fireEvent.click(screen.getByTestId('addFiles'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Proceed' })).toBeInTheDocument();
    });
  });

  test('shows Add Files button inside dialog', async () => {
    renderKnowledgeBaseOptions();

    fireEvent.click(screen.getByTestId('addFiles'));

    await waitFor(() => {
      expect(screen.getByText('Add Files')).toBeInTheDocument();
    });
  });

  test('shows knowledgeBaseName as fallback when vectorStoreId is empty', async () => {
    const props = {
      ...baseProps,
      vectorStoreId: '',
      formikValues: {
        ...baseProps.formikValues,
        knowledgeBaseVersionId: 'kbv-1',
        knowledgeBaseName: 'My Knowledge Base',
      },
    };

    renderKnowledgeBaseOptions(props);

    await waitFor(() => {
      expect(screen.getByText('My Knowledge Base')).toBeInTheDocument();
    });
  });

  test('shows vectorStoreId when vectorStoreId is provided', async () => {
    const props = {
      ...baseProps,
      vectorStoreId: 'vs_abc123',
      formikValues: {
        ...baseProps.formikValues,
        knowledgeBaseVersionId: 'kbv-1',
        knowledgeBaseName: 'My Knowledge Base',
      },
    };

    renderKnowledgeBaseOptions(props);

    await waitFor(() => {
      expect(screen.getByText('vs_abc123')).toBeInTheDocument();
    });
  });

  test('shows read-only note for legacy vector store inside dialog', async () => {
    const props = {
      ...baseProps,
      isLegacyVectorStore: true,
    };

    renderKnowledgeBaseOptions(props);

    fireEvent.click(screen.getByTestId('addFiles'));

    await waitFor(() => {
      expect(screen.getByTestId('readOnlyNote')).toBeInTheDocument();
    });
  });
});

describe('KnowledgeBaseOptions upload queue behavior', () => {
  test('uploads at most 10 files concurrently and starts next queued file on completion', async () => {
    const selectedFiles = Array.from({ length: 12 }, (_, index) => {
      return new File(['content'], `queue-file-${index}.txt`, { type: 'text/plain' });
    });

    const mocks = [
      ...Array.from({ length: 10 }, (_, index) =>
        createUploadSuccessMock(`queue-file-${index}.txt`, index === 0 ? 500 : Infinity)
      ),
      createUploadSuccessMock('queue-file-10.txt', Infinity),
      createUploadSuccessMock('queue-file-11.txt', Infinity),
    ];

    render(
      <MockedProvider mocks={mocks}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: selectedFiles,
      },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('uploadingIcon').length).toBe(10);
      expect(screen.getAllByTestId('queuedIcon').length).toBe(2);
    });

    await waitFor(
      () => {
        expect(screen.getAllByTestId('uploadingIcon').length).toBe(10);
        expect(screen.getAllByTestId('queuedIcon').length).toBe(1);
      },
      { timeout: 1000 }
    );
  });

  test('does not enqueue new uploads after closing dialog', async () => {
    const selectedFiles = Array.from({ length: 12 }, (_, index) => {
      return new File(['content'], `cancel-file-${index}.txt`, { type: 'text/plain' });
    });

    const mocks = [
      createUploadSuccessMock('cancel-file-0.txt', 200),
      ...Array.from({ length: 11 }, (_, idx) => createUploadSuccessMock(`cancel-file-${idx + 1}.txt`, Infinity)),
    ];

    render(
      <MockedProvider mocks={mocks}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: { files: selectedFiles },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('queuedIcon').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByTestId('cancel-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('uploadFile')).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId('uploadFile')).not.toBeInTheDocument();
    expect(screen.queryByTestId('uploadingIcon')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('queuedIcon').length).toBeLessThanOrEqual(11);
  });

  test('orders file rows with queued first, then failed, and completed at the bottom', async () => {
    const files = Array.from(
      { length: 12 },
      (_, index) => new File(['content'], `order-file-${index}.txt`, { type: 'text/plain' })
    );

    const mocks = Array.from({ length: 12 }, (_, idx) =>
      idx === 1
        ? createUploadErrorMock('order-file-1.txt', new Error('bad file'), 200)
        : createUploadSuccessMock(`order-file-${idx}.txt`, Infinity)
    );

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <KnowledgeBaseOptions
          {...baseProps}
          formikValues={{
            ...baseProps.formikValues,
            initialFiles: [
              {
                fileId: 'existing-file-id',
                filename: 'existing-file.txt',
                uploadedAt: '2026-01-01',
                fileSize: 10,
              },
            ],
          }}
        />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: { files },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('queuedIcon').length).toBeGreaterThan(0);
    });

    await waitFor(
      () => {
        expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    const fileRowsText = screen.getAllByTestId('fileItem').map((row) => row.textContent || '');
    const existingIndex = fileRowsText.findIndex((text) => text.includes('existing-file.txt'));
    const failedIndex = fileRowsText.findIndex((text) => text.includes('order-file-1.txt'));
    const queuedIndex = fileRowsText.findIndex((text) => text.includes('order-file-11.txt'));

    expect(queuedIndex).toBeGreaterThan(-1);
    expect(failedIndex).toBeGreaterThan(-1);
    expect(existingIndex).toBeGreaterThan(-1);
    expect(queuedIndex).toBeLessThan(failedIndex);
    expect(failedIndex).toBeLessThan(existingIndex);
  });

  test('does not allow deleting a file while file upload is in progress', async () => {
    const mocks = [createUploadSuccessMock('in-progress.txt', Infinity)];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'in-progress.txt', { type: 'text/plain' })],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('in-progress.txt')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('deleteFile'));
    expect(screen.getByText('in-progress.txt')).toBeInTheDocument();
  });

  test('allows deleting queued, failed and attached files', async () => {
    const files = Array.from(
      { length: 12 },
      (_, index) => new File(['content'], `state-file-${index}.txt`, { type: 'text/plain' })
    );

    const mocks = [
      createUploadSuccessMock('state-file-0.txt', 100),
      createUploadErrorMock('state-file-1.txt', new Error('bad file'), 150),
      ...Array.from({ length: 8 }, (_, i) => createUploadSuccessMock(`state-file-${i + 2}.txt`, Infinity)),
      createUploadSuccessMock('state-file-10.txt'),
      createUploadSuccessMock('state-file-11.txt'),
    ];

    render(
      <MockedProvider mocks={mocks}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: { files },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('queuedIcon').length).toBeGreaterThan(0);
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

  test('shows warning notification on proceed when files have failed uploads', async () => {
    const mocks = [createUploadErrorMock('bad-file.txt', new Error('Upload failed due to invalid content'))];

    render(
      <MockedProvider mocks={mocks}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'bad-file.txt', { type: 'text/plain' })],
      },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('failedIcon').length).toBeGreaterThan(0);
      expect(setNotificationSpy).toHaveBeenCalledWith(
        'Some file uploads failed, hover the failure to see the reason',
        'warning'
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Proceed' }));

    await waitFor(() => {
      expect(setNotificationSpy).toHaveBeenCalledWith(
        'Remove or re-upload files that failed before saving.',
        'warning'
      );
    });
  });

  test('shows only close action for already saved files', async () => {
    render(
      <MockedProvider mocks={[]}>
        <KnowledgeBaseOptions
          {...baseProps}
          formikValues={{
            ...baseProps.formikValues,
            initialFiles: [
              {
                fileId: 'existing-file-id',
                filename: 'existing-file.txt',
                uploadedAt: '2026-01-01',
                fileSize: 10,
              },
            ],
          }}
        />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));

    await waitFor(() => {
      expect(screen.getByText('existing-file.txt')).toBeInTheDocument();
      expect(screen.getByTestId('deleteFile')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('attachedIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('queuedIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('failedIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('retryFile')).not.toBeInTheDocument();
  });

  test('allows retrying a failed file while another upload is still in progress', async () => {
    const mocks = [
      createUploadSuccessMock('stuck-upload.txt', Infinity),
      createUploadErrorMock('retry-failed.txt', new Error('temporary failure'), 50),
      createUploadSuccessMock('retry-failed.txt', 50),
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );
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
      expect(screen.getAllByTestId('failedIcon').length).toBeGreaterThan(0);
      expect(screen.getByTestId('retryFile')).toBeEnabled();
    });

    fireEvent.click(screen.getByTestId('retryFile'));

    await waitFor(() => {
      expect(screen.queryByTestId('failedIcon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('retryFile')).not.toBeInTheDocument();
      expect(screen.getByTestId('attachedIcon')).toBeInTheDocument();
    });
  });

  test('retries upload request when rate limit errors occur', async () => {
    vi.useFakeTimers();

    let successResponseCount = 0;

    const mocks = [
      createUploadErrorMock('rate-limit-retry.txt', rateLimitError),
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'rate-limit-retry.txt',
        result: () => {
          successResponseCount += 1;
          return {
            data: {
              uploadFilesearchFile: {
                fileId: 'id-rate-limit-retry.txt',
                filename: 'rate-limit-retry.txt',
                uploadedAt: '2026-01-01',
                fileSize: 12,
              },
            },
          };
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('addFiles'));

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'rate-limit-retry.txt', { type: 'text/plain' })],
      },
    });

    await act(async () => {
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });
    expect(successResponseCount).toBe(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });
    expect(successResponseCount).toBe(1);
    expect(screen.getByTestId('attachedIcon')).toBeInTheDocument();
  });

  test('shows failure state and tooltip message after exhausting rate limit retries', async () => {
    vi.useFakeTimers();

    const mocks = Array.from({ length: 5 }, () => createUploadErrorMock('rate-limit-exhausted.txt', rateLimitError));

    render(
      <MockedProvider mocks={mocks}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('addFiles'));

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'rate-limit-exhausted.txt', { type: 'text/plain' })],
      },
    });

    await act(async () => {
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000 + 4000 + 8000 + 16000);
      vi.runOnlyPendingTimers();
      await Promise.resolve();
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });

    expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
    expect(setNotificationSpy).toHaveBeenCalledWith(
      'Some file uploads failed, hover the failure to see the reason',
      'warning'
    );

    vi.useRealTimers();
    fireEvent.mouseOver(screen.getByTestId('failedIcon'));
    await waitFor(() => {
      expect(screen.getByText('429 Too Many Requests')).toBeInTheDocument();
    });
  });

  test('shows queued icon while upload waits in queue', async () => {
    const files = Array.from(
      { length: 11 },
      (_, index) => new File(['content'], `queued-state-${index}.txt`, { type: 'text/plain' })
    );

    const mocks = [
      createUploadSuccessMock('queued-state-0.txt', Infinity),
      ...files.slice(1).map((file) => createUploadSuccessMock(file.name)),
    ];

    render(
      <MockedProvider mocks={mocks}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('addFiles'));

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: { files },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('queuedIcon').length).toBeGreaterThan(0);
    });
  });

  test('shows failed icon with error tooltip on upload failure', async () => {
    const mocks = [createUploadErrorMock('broken-file.txt', new Error('Invalid file format'))];

    render(
      <MockedProvider mocks={mocks}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('addFiles'));

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'broken-file.txt', { type: 'text/plain' })],
      },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('failedIcon').length).toBeGreaterThan(0);
    });

    fireEvent.mouseOver(screen.getAllByTestId('failedIcon')[0]);
    await waitFor(() => {
      expect(screen.getByText(/invalid file format|failed to upload file/i)).toBeInTheDocument();
    });
  });

  test('rejects entire selection when any file is above 20MB', async () => {
    render(
      <MockedProvider mocks={[]}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('addFiles'));

    const validFile = new File(['content'], 'valid-file.txt', { type: 'text/plain' });
    const largeFile = new File(['content'], 'large-file.txt', { type: 'text/plain' });
    Object.defineProperty(largeFile, 'size', { value: 21 * 1024 * 1024 });

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [validFile, largeFile],
      },
    });

    await waitFor(() => {
      expect(setNotificationSpy).toHaveBeenCalledWith('large-file.txt is above 20MB', 'warning');
    });
    expect(screen.queryByText('valid-file.txt')).not.toBeInTheDocument();
    expect(screen.queryByText('large-file.txt')).not.toBeInTheDocument();
  });

  test('keeps file uploading state when retry backoff sleep is aborted immediately', async () => {
    const originalAbortController = globalThis.AbortController;

    class ImmediatelyAbortedAbortController {
      public signal: AbortSignal;
      constructor() {
        const ac = new originalAbortController();
        ac.abort();
        this.signal = ac.signal;
      }
      abort() {
        // no-op; signal is already aborted by construction
      }
    }

    (globalThis as any).AbortController = ImmediatelyAbortedAbortController;

    try {
      const mocks = [createUploadErrorMock('immediate-abort-rate-limit.txt', rateLimitError)];

      render(
        <MockedProvider mocks={mocks}>
          <KnowledgeBaseOptions {...baseProps} />
        </MockedProvider>
      );

      fireEvent.click(screen.getByTestId('addFiles'));
      fireEvent.change(screen.getByTestId('uploadFile'), {
        target: {
          files: [new File(['content'], 'immediate-abort-rate-limit.txt', { type: 'text/plain' })],
        },
      });

      await waitFor(() => {
        expect(screen.getAllByTestId('uploadingIcon').length).toBeGreaterThan(0);
      });
      expect(screen.queryByTestId('failedIcon')).not.toBeInTheDocument();
    } finally {
      (globalThis as any).AbortController = originalAbortController;
    }
  });

  test('does not transition file to failed when upload is aborted during retry attempts', async () => {
    const abortError = new Error('Aborted');
    (abortError as any).name = 'AbortError';

    const mocks = [createUploadErrorMock('upload-abort-attempt.txt', abortError)];

    render(
      <MockedProvider mocks={mocks}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'upload-abort-attempt.txt', { type: 'text/plain' })],
      },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('uploadingIcon').length).toBeGreaterThan(0);
    });
    expect(screen.queryByTestId('failedIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('attachedIcon')).not.toBeInTheDocument();
  });

  test('shows upload error tooltip when an abort-like error is not recognized as AbortError', async () => {
    const originalAbortController = globalThis.AbortController;
    const originalDOMException = globalThis.DOMException;

    class ImmediatelyAbortedAbortController {
      public signal: AbortSignal;
      constructor() {
        const ac = new originalAbortController();
        ac.abort();
        this.signal = ac.signal;
      }
      abort() {
        // no-op
      }
    }

    class FakeDOMException extends Error {
      name = 'NotAbortError';
      constructor(message: string, _unused: string) {
        super(message);
      }
    }

    (globalThis as any).AbortController = ImmediatelyAbortedAbortController;
    (globalThis as any).DOMException = FakeDOMException;

    try {
      const rateLimitError = new Error('429 Too Many Requests');
      (rateLimitError as any).networkError = { statusCode: 429 };

      const mocks = [createUploadErrorMock('abort-not-recognized.txt', rateLimitError)];

      render(
        <MockedProvider mocks={mocks}>
          <KnowledgeBaseOptions {...baseProps} />
        </MockedProvider>
      );

      fireEvent.click(screen.getByTestId('addFiles'));
      fireEvent.change(screen.getByTestId('uploadFile'), {
        target: {
          files: [new File(['content'], 'abort-not-recognized.txt', { type: 'text/plain' })],
        },
      });

      await waitFor(() => {
        expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
      });

      fireEvent.mouseOver(screen.getByTestId('failedIcon'));
      await waitFor(() => {
        expect(screen.getByText('Aborted')).toBeInTheDocument();
      });
    } finally {
      (globalThis as any).AbortController = originalAbortController;
      (globalThis as any).DOMException = originalDOMException;
    }
  });

  test('marks file as failed and shows tooltip message after upload error', async () => {
    const mocks = [createUploadErrorMock('then-failed.txt', new Error('then-failed-error'))];

    render(
      <MockedProvider mocks={mocks}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'then-failed.txt', { type: 'text/plain' })],
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
    });

    fireEvent.mouseOver(screen.getByTestId('failedIcon'));
    await waitFor(() => {
      expect(screen.getByText('then-failed-error')).toBeInTheDocument();
    });
  });

  test('marks file as failed when uploadFile rejects and sets tooltip from upload error', async () => {
    const originalMapDelete = Map.prototype.delete;

    vi.spyOn(Map.prototype, 'delete').mockImplementation(function (this: Map<any, any>, key: any) {
      if (typeof key === 'string' && key.includes('catch-reject-delete.txt')) {
        throw new Error('map-delete-explosion');
      }
      return originalMapDelete.call(this, key);
    });

    const mocks = [createUploadSuccessMock('catch-reject-delete.txt')];

    try {
      render(
        <MockedProvider mocks={mocks}>
          <KnowledgeBaseOptions {...baseProps} />
        </MockedProvider>
      );

      fireEvent.click(screen.getByTestId('addFiles'));
      fireEvent.change(screen.getByTestId('uploadFile'), {
        target: {
          files: [new File(['content'], 'catch-reject-delete.txt', { type: 'text/plain' })],
        },
      });

      await waitFor(() => {
        expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
      });

      fireEvent.mouseOver(screen.getByTestId('failedIcon'));
      await waitFor(() => {
        expect(screen.getByText('map-delete-explosion')).toBeInTheDocument();
      });
    } finally {
      vi.restoreAllMocks();
    }
  });

  test('does not mark file as failed when uploadFile rejects with AbortError', async () => {
    const originalMapDelete = Map.prototype.delete;

    const abortError = new Error('Aborted');
    (abortError as any).name = 'AbortError';

    vi.spyOn(Map.prototype, 'delete').mockImplementation(function (this: Map<any, any>, key: any) {
      if (typeof key === 'string' && key.includes('catch-abort-early-return.txt')) {
        throw abortError;
      }
      return originalMapDelete.call(this, key);
    });

    const mocks = [createUploadSuccessMock('catch-abort-early-return.txt')];

    try {
      render(
        <MockedProvider mocks={mocks}>
          <KnowledgeBaseOptions {...baseProps} />
        </MockedProvider>
      );

      fireEvent.click(screen.getByTestId('addFiles'));
      fireEvent.change(screen.getByTestId('uploadFile'), {
        target: { files: [new File(['content'], 'catch-abort-early-return.txt', { type: 'text/plain' })] },
      });

      await waitFor(() => {
        expect(screen.getAllByTestId('uploadingIcon').length).toBeGreaterThan(0);
      });
      expect(screen.queryByTestId('failedIcon')).not.toBeInTheDocument();
    } finally {
      vi.restoreAllMocks();
    }
  });

  test('falls back to default failure message when upload error has no message', async () => {
    const originalMapDelete = Map.prototype.delete;

    vi.spyOn(Map.prototype, 'delete').mockImplementation(function (this: Map<any, any>, key: any) {
      if (typeof key === 'string' && key.includes('catch-fallback-default-error.txt')) {
        throw { name: 'SomeError' };
      }
      return originalMapDelete.call(this, key);
    });

    const mocks = [createUploadSuccessMock('catch-fallback-default-error.txt')];

    try {
      render(
        <MockedProvider mocks={mocks}>
          <KnowledgeBaseOptions {...baseProps} />
        </MockedProvider>
      );

      fireEvent.click(screen.getByTestId('addFiles'));
      fireEvent.change(screen.getByTestId('uploadFile'), {
        target: { files: [new File(['content'], 'catch-fallback-default-error.txt', { type: 'text/plain' })] },
      });

      await waitFor(() => {
        expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
      });

      fireEvent.mouseOver(screen.getByTestId('failedIcon'));
      await waitFor(() => {
        expect(screen.getByText('Failed to upload file')).toBeInTheDocument();
      });
    } finally {
      vi.restoreAllMocks();
    }
  });

  test('does not log enqueue errors when Promise.all rejects with AbortError', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const abortError = new Error('Aborted');
    (abortError as any).name = 'AbortError';

    const originalPromiseAll = Promise.all;
    (Promise as any).all = () => Promise.reject(abortError);

    try {
      const mocks = [createUploadSuccessMock('abort-catch-console.txt')];

      render(
        <MockedProvider mocks={mocks}>
          <KnowledgeBaseOptions {...baseProps} />
        </MockedProvider>
      );

      fireEvent.click(screen.getByTestId('addFiles'));
      fireEvent.change(screen.getByTestId('uploadFile'), {
        target: {
          files: [new File(['content'], 'abort-catch-console.txt', { type: 'text/plain' })],
        },
      });

      await waitFor(() => {
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });
    } finally {
      vi.restoreAllMocks();
      Promise.all = originalPromiseAll;
    }
  });

  test('logs enqueue errors when Promise.all rejects with a non-abort error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('queue-push-broke');

    const originalPromiseAll = Promise.all;
    (Promise as any).all = () => Promise.reject(error);

    try {
      const mocks = [createUploadSuccessMock('console-catch-nonabort.txt')];

      render(
        <MockedProvider mocks={mocks}>
          <KnowledgeBaseOptions {...baseProps} />
        </MockedProvider>
      );

      fireEvent.click(screen.getByTestId('addFiles'));
      fireEvent.change(screen.getByTestId('uploadFile'), {
        target: {
          files: [new File(['content'], 'console-catch-nonabort.txt', { type: 'text/plain' })],
        },
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error uploading files:');
      });
    } finally {
      vi.restoreAllMocks();
      Promise.all = originalPromiseAll;
    }
  });

  test('aborts the upload controller when a file is removed and its controller entry still exists', async () => {
    const fileName = 'remove-controller-entry.txt';
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

    const originalMapDelete = Map.prototype.delete;
    vi.spyOn(Map.prototype, 'delete').mockImplementation(function (this: Map<any, any>, key: any) {
      if (typeof key === 'string' && key.includes(fileName)) {
        return true;
      }
      return originalMapDelete.call(this, key);
    });

    const mocks = [createUploadErrorMock(fileName, new Error('upload-failure'))];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: { files: [new File(['content'], fileName, { type: 'text/plain' })] },
    });

    await waitFor(() => {
      expect(screen.getByText(fileName)).toBeInTheDocument();
      expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
    });

    const fileItem = screen.getByText(fileName).closest('[data-testid="fileItem"]')!;
    const deleteButton = fileItem.querySelector('[data-testid="deleteFile"]') as HTMLButtonElement;
    expect(deleteButton).not.toBeDisabled();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText(fileName)).not.toBeInTheDocument();
    });

    expect(abortSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  test('closes dialog without API call when no files have changed', async () => {
    const existingFile = { fileId: 'existing-id', filename: 'existing.txt', uploadedAt: '2026-01-01', fileSize: 10 };

    render(
      <MockedProvider mocks={[]}>
        <KnowledgeBaseOptions
          {...baseProps}
          formikValues={{ ...baseProps.formikValues, initialFiles: [existingFile] }}
        />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));

    await waitFor(() => {
      expect(screen.getByText('existing.txt')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Proceed' }));

    await waitFor(() => {
      expect(screen.queryByText('Manage Knowledge Base')).not.toBeInTheDocument();
    });
  });

  test('calls setErrorMessage when createKnowledgeBase returns an error', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});

    const keepFile = { fileId: 'keep-id', filename: 'keep.txt', uploadedAt: '2026-01-01', fileSize: 10 };
    const removeFile = { fileId: 'remove-id', filename: 'remove.txt', uploadedAt: '2026-01-02', fileSize: 15 };

    const kbErrorMock = {
      request: {
        query: CREATE_KNOWLEDGE_BASE,
        variables: {
          createKnowledgeBaseId: 'kb-1',
          mediaInfo: [{ fileId: 'keep-id', filename: 'keep.txt', uploadedAt: '2026-01-01', fileSize: 10 }],
        },
      },
      error: new Error('KB creation failed'),
    };

    render(
      <MockedProvider mocks={[kbErrorMock]}>
        <KnowledgeBaseOptions
          {...baseProps}
          formikValues={{ ...baseProps.formikValues, initialFiles: [keepFile, removeFile] }}
        />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));

    await waitFor(() => {
      expect(screen.getByText('remove.txt')).toBeInTheDocument();
    });

    fireEvent.click(
      screen
        .getByText('remove.txt')
        .closest('[data-testid="fileItem"]')!
        .querySelector('[data-testid="deleteFile"]')!
    );

    await waitFor(() => {
      expect(screen.queryByText('remove.txt')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Proceed' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Proceed' }));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });

    errorSpy.mockRestore();
  });
});

describe('KnowledgeBaseOptions temperature input validation', () => {
  const renderOptions = () =>
    render(
      <MockedProvider mocks={[]}>
        <KnowledgeBaseOptions {...baseProps} />
      </MockedProvider>
    );

  test('shows error text when temperature value is out of range (> 2)', () => {
    renderOptions();
    const slider = screen.getByTestId('sliderDisplay');
    fireEvent.change(slider, { target: { value: '3' } });
    expect(screen.getByText('Temperature value should be between 0-2')).toBeInTheDocument();
  });

  test('shows error text when temperature value is negative', () => {
    renderOptions();
    const slider = screen.getByTestId('sliderDisplay');
    fireEvent.change(slider, { target: { value: '-1' } });
    expect(screen.getByText('Temperature value should be between 0-2')).toBeInTheDocument();
  });

  test('clears error and calls setFieldValue when a valid value is entered after an error', () => {
    const setFieldValue = vi.fn();
    render(
      <MockedProvider mocks={[]}>
        <KnowledgeBaseOptions {...baseProps} setFieldValue={setFieldValue} />
      </MockedProvider>
    );
    const slider = screen.getByTestId('sliderDisplay');

    fireEvent.change(slider, { target: { value: '3' } });
    expect(screen.getByText('Temperature value should be between 0-2')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '1.5' } });
    expect(screen.queryByText('Temperature value should be between 0-2')).not.toBeInTheDocument();
    expect(setFieldValue).toHaveBeenCalledWith('temperature', 1.5);
  });
});
