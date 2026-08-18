import { MockedProvider } from '@apollo/client/testing/react';
import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';
import * as Utils from 'common/utils';
import { UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';
import KnowledgeBase from './KnowledgeBase';

const existingFile = { fileId: 'file-1', filename: 'nutrition_faq.pdf', fileSize: 1_200_000 };

const uploadMock = (filename: string, fileId: string) => ({
  request: { query: UPLOAD_FILE_TO_KAAPI, variables: () => true },
  result: {
    data: {
      uploadFilesearchFile: { fileId, filename, uploadedAt: '2026-08-04T10:00:00Z', fileSize: 2048 },
    },
  },
});

const renderTab = (props: Partial<Parameters<typeof KnowledgeBase>[0]> = {}, mocks: any[] = []) => {
  const onFilesChange = vi.fn();
  const onFilesUploaded = vi.fn();

  const Harness = () => {
    const [uploading, setUploading] = useState<string[]>([]);
    return (
      <KnowledgeBase
        files={[existingFile]}
        onFilesChange={onFilesChange}
        onFilesUploaded={onFilesUploaded}
        uploading={uploading}
        onUploadingChange={setUploading}
        vectorStoreId="vs_abc123"
        {...props}
      />
    );
  };

  render(
    <MockedProvider mocks={mocks}>
      <Harness />
    </MockedProvider>
  );
  return { onFilesChange, onFilesUploaded };
};

const pickFiles = (files: File[]) => {
  const input = screen.getByTestId('fileInput');
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  fireEvent.change(input);
};

const pickFile = (file: File) => {
  const input = screen.getByTestId('fileInput');
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  fireEvent.change(input);
};

test('lists attached files with their size and count', () => {
  renderTab();

  expect(screen.getByTestId('fileCount')).toHaveTextContent('1 file attached');
  expect(screen.getByTestId('knowledgeBaseFile')).toHaveTextContent('nutrition_faq.pdf');
  expect(screen.getByTestId('knowledgeBaseFile')).toHaveTextContent('1.1 MB');
});

test('shows an empty state when nothing is attached', () => {
  renderTab({ files: [] });

  expect(screen.getByTestId('knowledgeBaseEmpty')).toBeInTheDocument();
  expect(screen.getByTestId('fileCount')).toHaveTextContent('0 files attached');
});

test('rejects a file over 20MB before uploading', () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
  const { onFilesChange } = renderTab();

  const big = new File(['x'], 'huge.pdf', { type: 'application/pdf' });
  Object.defineProperty(big, 'size', { value: 21 * 1024 * 1024 });
  pickFile(big);

  expect(notificationSpy).toHaveBeenCalledWith(expect.stringContaining('huge.pdf'), 'warning');
  expect(onFilesChange).not.toHaveBeenCalled();
  notificationSpy.mockRestore();
});

test('uploads on pick and stages the file — no knowledge base call yet', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
  const { onFilesUploaded } = renderTab({}, [uploadMock('guide.pdf', 'file-2')]);

  pickFile(new File(['x'], 'guide.pdf', { type: 'application/pdf' }));

  expect(screen.getByTestId('uploadingFile')).toHaveTextContent('guide.pdf');

  await waitFor(() => {
    // only the new file — the page appends it, so a late upload cannot clobber the list
    expect(onFilesUploaded).toHaveBeenCalledWith([
      { fileId: 'file-2', filename: 'guide.pdf', uploadedAt: '2026-08-04T10:00:00Z', fileSize: 2048 },
    ]);
  });
  expect(notificationSpy).toHaveBeenCalledWith('Files uploaded — save a version to apply them');
  notificationSpy.mockRestore();
});

test('strips __typename from the upload result — FileInfoInput rejects it', async () => {
  const { onFilesUploaded } = renderTab({}, [
    {
      request: { query: UPLOAD_FILE_TO_KAAPI, variables: () => true },
      result: {
        data: {
          uploadFilesearchFile: {
            __typename: 'FileResult',
            fileId: 'file-2',
            filename: 'guide.pdf',
            uploadedAt: '2026-08-04T10:00:00Z',
            fileSize: 2048,
          },
        },
      },
    },
  ]);

  pickFile(new File(['x'], 'guide.pdf', { type: 'application/pdf' }));

  await waitFor(() => {
    expect(onFilesUploaded).toHaveBeenCalled();
  });
  const staged = onFilesUploaded.mock.calls[0][0];
  expect(staged[0]).not.toHaveProperty('__typename');
  expect(Object.keys(staged[0]).sort()).toEqual(['fileId', 'fileSize', 'filename', 'uploadedAt']);
});

test('a failed upload is reported and nothing is staged', async () => {
  const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
  const { onFilesUploaded } = renderTab({}, [
    { request: { query: UPLOAD_FILE_TO_KAAPI, variables: () => true }, error: new Error('Upload failed') },
  ]);

  pickFile(new File(['x'], 'guide.pdf', { type: 'application/pdf' }));

  await waitFor(() => {
    expect(errorSpy).toHaveBeenCalled();
  });
  expect(onFilesUploaded).not.toHaveBeenCalled();
  expect(screen.queryByTestId('uploadingFile')).not.toBeInTheDocument();
  errorSpy.mockRestore();
});

test('removing a file asks first, then stages the shorter list', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
  const { onFilesChange } = renderTab();

  fireEvent.click(screen.getByTestId('removeFileButton'));
  expect(screen.getByText('Remove nutrition_faq.pdf?')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Remove file'));

  expect(onFilesChange).toHaveBeenCalledWith([]);
  expect(notificationSpy).toHaveBeenCalledWith('File removed — save a version to apply it');
  notificationSpy.mockRestore();
});

test('cancelling the remove dialog changes nothing', async () => {
  const { onFilesChange } = renderTab();

  fireEvent.click(screen.getByTestId('removeFileButton'));
  fireEvent.click(screen.getByText('Cancel'));

  await waitFor(() => {
    expect(screen.queryByText('Remove nutrition_faq.pdf?')).not.toBeInTheDocument();
  });
  expect(onFilesChange).not.toHaveBeenCalled();
});

test('a legacy assistant is read-only', () => {
  renderTab({ legacy: true });

  expect(screen.getByTestId('legacyNotice')).toBeInTheDocument();
  expect(screen.getByTestId('addFilesButton')).toBeDisabled();
  expect(screen.queryByTestId('removeFileButton')).not.toBeInTheDocument();
});

describe('technical details', () => {
  test('stays collapsed until asked for, then shows the vector store id', () => {
    const copySpy = vi.spyOn(Utils, 'copyToClipboard').mockImplementation(() => {});
    renderTab();

    expect(screen.queryByTestId('vectorStoreId')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('technicalDetailsToggle'));
    expect(screen.getByTestId('vectorStoreId')).toHaveTextContent('vs_abc123');

    fireEvent.click(screen.getByTestId('copyVectorStoreId'));
    expect(copySpy).toHaveBeenCalledWith('vs_abc123');
    copySpy.mockRestore();
  });

  test('explains when no vector store exists yet', () => {
    renderTab({ files: [], vectorStoreId: null });

    fireEvent.click(screen.getByTestId('technicalDetailsToggle'));

    expect(screen.getByTestId('noVectorStore')).toBeInTheDocument();
  });
});

test('a mixed batch keeps the files that uploaded and names the ones that did not', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
  const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});

  // first file succeeds, second fails — the batch must not lose the first
  const { onFilesUploaded } = renderTab({}, [
    uploadMock('good.pdf', 'file-good'),
    { request: { query: UPLOAD_FILE_TO_KAAPI, variables: () => true }, error: new Error('Upload failed') },
  ]);

  pickFiles([
    new File(['x'], 'good.pdf', { type: 'application/pdf' }),
    new File(['x'], 'bad.pdf', { type: 'application/pdf' }),
  ]);

  await waitFor(() => {
    expect(onFilesUploaded).toHaveBeenCalled();
  });

  const staged = onFilesUploaded.mock.calls[0][0];
  expect(staged).toHaveLength(1);
  expect(staged[0].fileId).toBe('file-good');

  expect(notificationSpy).toHaveBeenCalledWith('Files uploaded — save a version to apply them');
  expect(notificationSpy).toHaveBeenCalledWith(expect.stringContaining('bad.pdf'), 'warning');
  expect(errorSpy).toHaveBeenCalled();

  notificationSpy.mockRestore();
  errorSpy.mockRestore();
});

test('a failure that is not rate limiting is not retried', async () => {
  const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
  const variableMatcher = vi.fn().mockReturnValue(true);

  const { onFilesUploaded } = renderTab({}, [
    { request: { query: UPLOAD_FILE_TO_KAAPI, variables: variableMatcher }, error: new Error('Upload failed') },
  ]);

  pickFile(new File(['x'], 'guide.pdf', { type: 'application/pdf' }));

  await waitFor(() => {
    expect(errorSpy).toHaveBeenCalled();
  });
  // one attempt only — retrying a non-rate-limit error just delays the failure
  expect(variableMatcher).toHaveBeenCalledTimes(1);
  expect(onFilesUploaded).not.toHaveBeenCalled();
  errorSpy.mockRestore();
});
