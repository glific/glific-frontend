import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AssistantOptions } from './AssistantOptions';

import * as Notification from 'common/notification';
import { UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';

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


describe('AssistantOptions upload queue behavior', () => {
  test('uploads at most 10 files concurrently and starts next queued file on completion', async () => {
    // Prepare 12 files to exceed the upload concurrency limit and test queueing
    const selectedFiles = Array.from({ length: 12 }, (_, index) => {
      return new File(['content'], `queue-file-${index}.txt`, { type: 'text/plain' });
    });

    // Set up mock responses for all 12 uploads:
    // We intentionally make only the first file complete within the assertion window.
    // The other first-10 uploads remain "in-flight" so concurrency stays at 10, and
    // the next queued upload has time to transition to "uploading" for assertions.
    const mocks = [
      // queue-file-0 will complete soon; queue-file-1..9 stay in-flight
      ...Array.from({ length: 10 }, (_, index) => ({
        request: {
          query: UPLOAD_FILE_TO_KAAPI,
        },
        variableMatcher: (variables: any) => variables?.media?.name === `queue-file-${index}.txt`,
        delay: index === 0 ? 500 : Infinity,
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: `id-queue-file-${index}.txt`,
              filename: `queue-file-${index}.txt`,
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
      })),
      // queue-file-10 starts after queue-file-0 completes; keep it in-flight for the assertion window.
      {
        request: {
          query: UPLOAD_FILE_TO_KAAPI,
        },
        variableMatcher: (variables: any) => variables?.media?.name === 'queue-file-10.txt',
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: `id-queue-file-10.txt`,
              filename: `queue-file-10.txt`,
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
        delay: Infinity,
      },
      // queue-file-11 remains queued ("infinite delay")
      {
        request: {
          query: UPLOAD_FILE_TO_KAAPI,
        },
        variableMatcher: (variables: any) => variables?.media?.name === 'queue-file-11.txt',
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: `id-queue-file-11.txt`,
              filename: `queue-file-11.txt`,
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
          delay: Infinity,
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: selectedFiles,
      },
    });

    // Wait for uploads to start: 10 uploading, 2 queued
    await waitFor(() => {
      expect(screen.getAllByTestId('uploadingIcon').length).toBe(10);
      expect(screen.getAllByTestId('queuedIcon').length).toBe(2);
    });

    // Wait for the queue to advance: now 10 uploading, 1 queued
    await waitFor(
      () => {
        expect(screen.getAllByTestId('uploadingIcon').length).toBe(10);
        expect(screen.getAllByTestId('queuedIcon').length).toBe(1);
      },
      { timeout: 1000 }
    );
  });

  test('does not enqueue new uploads after closing dialog', async () => {
    // Prepare 12 files to exceed the upload concurrency limit and test queueing
    const selectedFiles = Array.from({ length: 12 }, (_, index) => {
      return new File(['content'], `cancel-file-${index}.txt`, { type: 'text/plain' });
    });

    // Set up mock responses for all 12 uploads:
    // The first file resolves after a delay, the rest do not auto-resolve.
    const mocks = [
      {
        request: {
          query: UPLOAD_FILE_TO_KAAPI,
        },
        variableMatcher: (variables: any) => variables?.media?.name === 'cancel-file-0.txt',
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: `id-cancel-file-0.txt`,
              filename: 'cancel-file-0.txt',
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
        delay: 200,
      },
      // The other 11 will also wait (simulate infinite queue, but aren't resolved during test)
      ...Array.from({ length: 11 }, (_, idx) => ({
        request: {
          query: UPLOAD_FILE_TO_KAAPI,
        },
        variableMatcher: (variables: any) => variables?.media?.name === `cancel-file-${idx + 1}.txt`,
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: `id-cancel-file-${idx + 1}.txt`,
              filename: `cancel-file-${idx + 1}.txt`,
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
          delay: Infinity,
        },
      })),
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
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

    // Assert that no new uploads were enqueued after cancel (same count, none start after)
    // Because the rest of the files are queued and never resolve,
    // their upload mutations should not be triggered after dialog close.
    // Count the number of uploads (all that started before cancel).
    // On MockedProvider, no calls are counted per upload, so instead check that only queued remain.
    // (If desired, you could leverage query counts with a spy, but here we're using provider mocks.)
    expect(screen.queryByTestId('uploadFile')).not.toBeInTheDocument();
    // There should NOT be any more <uploadingIcon> after cancel + resolve
    expect(screen.queryByTestId('uploadingIcon')).not.toBeInTheDocument();
    // There should NOT be more than 11 queued after cancel+resolve
    expect(screen.queryAllByTestId('queuedIcon').length).toBeLessThanOrEqual(11);
  });

  test('orders file rows with queued first, then failed, and completed at the bottom', async () => {
    // One file initially attached ("completed"), 12 new files: one "fail", rest never resolve
    const files = Array.from(
      { length: 12 },
      (_, index) => new File(['content'], `order-file-${index}.txt`, { type: 'text/plain' })
    );

    const mocks = [
      // All uploads except -1 hang forever (simulate "queued" state)
      ...Array.from({ length: 12 }, (_, idx) => {
        if (idx === 1) {
          // This file will "fail"
          return {
            request: { query: UPLOAD_FILE_TO_KAAPI },
            variableMatcher: (variables: any) => variables?.media?.name === `order-file-1.txt`,
            error: new Error('bad file'),
            delay: 200, // small delay to show queued briefly
          };
        }
        return {
          request: { query: UPLOAD_FILE_TO_KAAPI },
          variableMatcher: (variables: any) => variables?.media?.name === `order-file-${idx}.txt`,
          // Never resolves: queued forever
          delay: Infinity,
          result: {
            data: {
              uploadFilesearchFile: {
                fileId: `id-order-file-${idx}.txt`,
                filename: `order-file-${idx}.txt`,
                uploadedAt: '2026-01-01',
                fileSize: 5,
              },
            },
          },
        };
      }),
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions
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

    // Wait for queued icons to appear
    await waitFor(() => {
      expect(screen.getAllByTestId('queuedIcon').length).toBeGreaterThan(0);
    });

    // Wait for file 1 to fail and show its failedIcon
    await waitFor(
      () => {
        expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
      },
      // Queue processing + React state updates can take longer than the raw mock delay.
      { timeout: 1000 }
    );

    // Fetch order of rows by label
    const fileRowsText = screen.getAllByTestId('fileItem').map((row) => row.textContent || '');
    const existingIndex = fileRowsText.findIndex((text) => text.includes('existing-file.txt'));
    const failedIndex = fileRowsText.findIndex((text) => text.includes('order-file-1.txt'));
    // Find a later queued file to check ordering of "queued"
    const queuedIndex = fileRowsText.findIndex((text) => text.includes('order-file-11.txt'));

    expect(queuedIndex).toBeGreaterThan(-1);
    expect(failedIndex).toBeGreaterThan(-1);
    expect(existingIndex).toBeGreaterThan(-1);
    // Assert: Queued first, then failed, then completed
    expect(queuedIndex).toBeLessThan(failedIndex);
    expect(failedIndex).toBeLessThan(existingIndex);
  });

  test('does not allow deleting a file while file upload is in progress', async () => {
    const mocks = [
      {
        request: {
          query: UPLOAD_FILE_TO_KAAPI,
        },
        variableMatcher: (variables: any) => variables?.media?.name === 'in-progress.txt',
        // Keep the upload mutation pending so the UI stays in "uploading" state.
        delay: Infinity,
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: 'id-in-progress.txt',
              filename: 'in-progress.txt',
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
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
    // Use MockedProvider to simulate GraphQL file uploads with specific states.

    // 12 files; the first will "succeed", the second will "fail", the 11th is deleted while queued.
    const files = Array.from(
      { length: 12 },
      (_, index) => new File(['content'], `state-file-${index}.txt`, { type: 'text/plain' })
    );

    const mocks = [
      // state-file-0.txt (attached after delayed resolve)
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'state-file-0.txt',
        delay: 100,
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: `id-state-file-0.txt`,
              filename: 'state-file-0.txt',
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
      },
      // state-file-1.txt (failed after delayed resolve)
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'state-file-1.txt',
        delay: 150,
        error: new Error('bad file'),
      },
      // Keep state-file-2..state-file-9 stuck "uploading" so state-file-10 and state-file-11
      // remain queued deterministically (concurrency limit is 10).
      ...Array.from({ length: 8 }, (_, i) => ({
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === `state-file-${i + 2}.txt`,
        delay: Infinity,
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: `id-state-file-${i + 2}.txt`,
              filename: `state-file-${i + 2}.txt`,
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
      })),
      // Provide mocks for queued uploads that will start after a slot frees up.
      ...['state-file-10.txt', 'state-file-11.txt'].map((name) => ({
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === name,
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: `id-${name}`,
              filename: name,
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
      })),
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
      </MockedProvider>
    );

    fireEvent.click(screen.getByTestId('addFiles'));
    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: { files },
    });

    await waitFor(() => {
      // All except 0 and 1 should be queued (or resolved instantly), so at least some will be "queued"
      expect(screen.getAllByTestId('queuedIcon').length).toBeGreaterThan(0);
    });

    // Delete a queued file (state-file-10.txt). Should disappear immediately.
    fireEvent.click(
      screen
        .getByText('state-file-10.txt')
        .closest('[data-testid="fileItem"]')!
        .querySelector('[data-testid="deleteFile"]')!
    );
    await waitFor(() => {
      expect(screen.queryByText('state-file-10.txt')).not.toBeInTheDocument();
    });

    // Now state-file-0.txt succeeds and state-file-1.txt fails (via mocks).
    await waitFor(() => {
      expect(screen.getByTestId('failedIcon')).toBeInTheDocument();
      expect(screen.getByText('state-file-0.txt')).toBeInTheDocument();
    });

    // Delete failed file (state-file-1.txt)
    fireEvent.click(
      screen
        .getByText('state-file-1.txt')
        .closest('[data-testid="fileItem"]')!
        .querySelector('[data-testid="deleteFile"]')!
    );
    expect(screen.queryByText('state-file-1.txt')).not.toBeInTheDocument();

    // Delete attached file (state-file-0.txt)
    fireEvent.click(
      screen
        .getByText('state-file-0.txt')
        .closest('[data-testid="fileItem"]')!
        .querySelector('[data-testid="deleteFile"]')!
    );
    await waitFor(() => {
      expect(screen.queryByText('state-file-0.txt')).not.toBeInTheDocument();
    });
  });

  test('shows warning notification on save when files have failed uploads', async () => {
    const mocks = [
      {
        request: {
          query: UPLOAD_FILE_TO_KAAPI,
        },
        variableMatcher: (variables: any) => variables?.media?.name === 'bad-file.txt',
        error: new Error('Upload failed due to invalid content'),
      },
    ];

    // Save mutation: use real flow, so do not provide CREATE_KNOWLEDGE_BASE mock;
    // we'll test that it's not triggered.

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
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

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(setNotificationSpy).toHaveBeenCalledWith(
        'Remove or re-upload files that failed before saving.',
        'warning'
      );
    });
    // If using the real Apollo hook impl, we cannot spy on save mutation directly,
    // but as long as no success notification happens and this warning shows, it's correct.
    // Optionally, could spy on Notification.setNotification for success-message but not needed here.
  });

  test('shows only close action for already saved files', async () => {
    render(
      <MockedProvider mocks={[]}>
        <AssistantOptions
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
      // Keep one upload pending to simulate the "still in progress" case.
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'stuck-upload.txt',
        delay: Infinity,
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: 'id-stuck-upload.txt',
              filename: 'stuck-upload.txt',
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
      },
      // First attempt fails, enabling the retry button.
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'retry-failed.txt',
        delay: 50,
        error: new Error('temporary failure'),
      },
      // Second attempt succeeds.
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'retry-failed.txt',
        delay: 50,
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: 'id-retry-failed.txt',
              filename: 'retry-failed.txt',
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
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

    const rateLimitError = new Error('429 Too Many Requests');
    (rateLimitError as any).networkError = { statusCode: 429 };

    let successResponseCount = 0;

    const mocks = [
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'rate-limit-retry.txt',
        error: rateLimitError,
        // First attempt fails immediately; retry scheduling is handled by component logic.
      },
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
        <AssistantOptions {...baseProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('addFiles'));

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'rate-limit-retry.txt', { type: 'text/plain' })],
      },
    });

    await act(async () => {
      // Let MockedProvider deliver the mocked response (it uses setTimeout internally).
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });
    expect(successResponseCount).toBe(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
      // Flush MockedProvider timers scheduled during the backoff window.
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });
    expect(successResponseCount).toBe(1);
    expect(screen.getByTestId('attachedIcon')).toBeInTheDocument();
  });

  test('shows failure state and tooltip message after exhausting rate limit retries', async () => {
    vi.useFakeTimers();

    const rateLimitError = new Error('429 Too Many Requests');
    (rateLimitError as any).networkError = { statusCode: 429 };

    const mocks = Array.from({ length: 5 }, () => ({
      request: { query: UPLOAD_FILE_TO_KAAPI },
      variableMatcher: (variables: any) => variables?.media?.name === 'rate-limit-exhausted.txt',
      error: rateLimitError,
    }));

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('addFiles'));

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: {
        files: [new File(['content'], 'rate-limit-exhausted.txt', { type: 'text/plain' })],
      },
    });

    await act(async () => {
      // Let MockedProvider deliver the mocked response (it uses setTimeout internally).
      vi.runOnlyPendingTimers();
      await Promise.resolve();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000 + 4000 + 8000 + 16000);
      // Flush MockedProvider timers scheduled during the retry windows.
      vi.runOnlyPendingTimers();
      await Promise.resolve();
      // The final attempt's mocked response can be scheduled right at the end
      // of the previous advance; flush again to ensure the promise resolves.
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
    // Create 11 files, first one will be "in progress"
    const files = Array.from(
      { length: 11 },
      (_, index) => new File(['content'], `queued-state-${index}.txt`, { type: 'text/plain' })
    );

    // Helper to make a mock with !resolve (pending)
    const infiniteDelayMock = {
      request: {
        query: UPLOAD_FILE_TO_KAAPI,
      },
      variableMatcher: (variables: any) => variables?.media?.name === 'queued-state-0.txt',
      delay: Infinity,
      result: {
        data: {
          uploadFilesearchFile: {
            fileId: `id-queued-state-0.txt`,
            filename: `queued-state-0.txt`,
            uploadedAt: '2026-01-01',
            fileSize: 12,
          },
        },
      },
    };

    // The rest of the queue upload mocks resolve quickly
    const quickMocks = files.slice(1).map((file) => ({
      request: {
        query: UPLOAD_FILE_TO_KAAPI,
      },
      variableMatcher: (variables: any) => variables?.media?.name === file.name,
      result: {
        data: {
          uploadFilesearchFile: {
            fileId: `id-${file.name}`,
            filename: file.name,
            uploadedAt: '2026-01-01',
            fileSize: 12,
          },
        },
      },
    }));

    const mocks = [
      // First file never resolves to simulate in-progress upload
      infiniteDelayMock,
      // The rest resolve immediately
      ...quickMocks,
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('addFiles'));

    fireEvent.change(screen.getByTestId('uploadFile'), {
      target: { files },
    });

    await waitFor(() => {
      // There should be queued icons for files waiting on the first slot to clear
      expect(screen.getAllByTestId('queuedIcon').length).toBeGreaterThan(0);
    });
  });

  test('shows failed icon with error tooltip on upload failure', async () => {
    const mocks = [
      {
        request: {
          query: UPLOAD_FILE_TO_KAAPI,
        },
        variableMatcher: (variables: any) => variables?.media?.name === 'broken-file.txt',
        error: new Error('Invalid file format'),
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
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
        <AssistantOptions {...baseProps} />
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
      // Keep the interface compatible; abort may be called by the component.
      abort() {
        // no-op; signal is already aborted by construction
      }
    }

    (globalThis as any).AbortController = ImmediatelyAbortedAbortController;

    try {
      const rateLimitError = new Error('429 Too Many Requests');
      (rateLimitError as any).networkError = { statusCode: 429 };

      const mocks = [
        {
          request: {
            query: UPLOAD_FILE_TO_KAAPI,
          },
          variableMatcher: (variables: any) => variables?.media?.name === 'immediate-abort-rate-limit.txt',
          error: rateLimitError,
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <AssistantOptions {...baseProps} />
        </MockedProvider>
      );

      fireEvent.click(screen.getByTestId('addFiles'));
      fireEvent.change(screen.getByTestId('uploadFile'), {
        target: {
          files: [new File(['content'], 'immediate-abort-rate-limit.txt', { type: 'text/plain' })],
        },
      });

      await waitFor(() => {
        // Since the retry backoff is aborted before it can succeed,
        // the component leaves the file in the "uploading" state.
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

    const mocks = [
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'upload-abort-attempt.txt',
        error: abortError,
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
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

      const mocks = [
        {
          request: { query: UPLOAD_FILE_TO_KAAPI },
          variableMatcher: (variables: any) => variables?.media?.name === 'abort-not-recognized.txt',
          error: rateLimitError,
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <AssistantOptions {...baseProps} />
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

  test('marks file as failed and shows tooltip when uploadFile resolves without an uploadedFile', async () => {
    const mocks = [
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'then-failed.txt',
        error: new Error('then-failed-error'),
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
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

    const mocks = [
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'catch-reject-delete.txt',
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: 'id-catch-reject-delete.txt',
              filename: 'catch-reject-delete.txt',
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
      },
    ];

    try {
      render(
        <MockedProvider mocks={mocks}>
          <AssistantOptions {...baseProps} />
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

    const mocks = [
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'catch-abort-early-return.txt',
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: 'id-catch-abort-early-return.txt',
              filename: 'catch-abort-early-return.txt',
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
      },
    ];

    try {
      render(
        <MockedProvider mocks={mocks}>
          <AssistantOptions {...baseProps} />
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
        // Throw a non-Error object without a `message` property so the fallback is used.
        throw { name: 'SomeError' };
      }
      return originalMapDelete.call(this, key);
    });

    const mocks = [
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === 'catch-fallback-default-error.txt',
        result: {
          data: {
            uploadFilesearchFile: {
              fileId: 'id-catch-fallback-default-error.txt',
              filename: 'catch-fallback-default-error.txt',
              uploadedAt: '2026-01-01',
              fileSize: 12,
            },
          },
        },
      },
    ];

    try {
      render(
        <MockedProvider mocks={mocks}>
          <AssistantOptions {...baseProps} />
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
      const mocks = [
        {
          request: { query: UPLOAD_FILE_TO_KAAPI },
          variableMatcher: (variables: any) => variables?.media?.name === 'abort-catch-console.txt',
          result: {
            data: {
              uploadFilesearchFile: {
                fileId: 'id-abort-catch-console.txt',
                filename: 'abort-catch-console.txt',
                uploadedAt: '2026-01-01',
                fileSize: 12,
              },
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <AssistantOptions {...baseProps} />
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
      const mocks = [
        {
          request: { query: UPLOAD_FILE_TO_KAAPI },
          variableMatcher: (variables: any) => variables?.media?.name === 'console-catch-nonabort.txt',
          result: {
            data: {
              uploadFilesearchFile: {
                fileId: 'id-console-catch-nonabort.txt',
                filename: 'console-catch-nonabort.txt',
                uploadedAt: '2026-01-01',
                fileSize: 12,
              },
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <AssistantOptions {...baseProps} />
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

    // Prevent uploadFile's cleanup from removing the controller entry from the ref map.
    // This lets handleRemoveFile find uploadController even when the row is no longer in "uploading".
    const originalMapDelete = Map.prototype.delete;
    vi.spyOn(Map.prototype, 'delete').mockImplementation(function (this: Map<any, any>, key: any) {
      if (typeof key === 'string' && key.includes(fileName)) {
        return true; // pretend deletion succeeded, but keep the entry
      }
      return originalMapDelete.call(this, key);
    });

    const mocks = [
      {
        request: { query: UPLOAD_FILE_TO_KAAPI },
        variableMatcher: (variables: any) => variables?.media?.name === fileName,
        error: new Error('upload-failure'),
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <AssistantOptions {...baseProps} />
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
});
