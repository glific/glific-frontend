import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';
import * as Utils from 'common/utils';
import { CREATE_KNOWLEDGE_BASE, UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';
import KnowledgeBase from './KnowledgeBase';

const existingFile = { fileId: 'file-1', filename: 'nutrition_faq.pdf', fileSize: 1_200_000 };

// the variable is a File instance, so match on the query alone rather than deep-equal
const uploadMock = (filename: string, fileId: string) => ({
  request: { query: UPLOAD_FILE_TO_KAAPI },
  variableMatcher: () => true,
  result: {
    data: {
      uploadFilesearchFile: { fileId, filename, uploadedAt: '2026-08-04T10:00:00Z', fileSize: 2048 },
    },
  },
});

const rebuildMock = (mediaInfo: any[], knowledgeBaseId: string | null = 'kb-1') => ({
  request: {
    query: CREATE_KNOWLEDGE_BASE,
    variables: { createKnowledgeBaseId: knowledgeBaseId, mediaInfo },
  },
  result: {
    data: {
      createKnowledgeBase: {
        knowledgeBase: { id: 'kb-1', knowledgeBaseVersionId: 'kbv-2', name: 'store' },
      },
    },
  },
});

const renderTab = (props: Partial<Parameters<typeof KnowledgeBase>[0]> = {}, mocks: any[] = []) => {
  const onKnowledgeBaseChange = vi.fn();
  render(
    <MockedProvider mocks={mocks}>
      <KnowledgeBase
        files={[existingFile]}
        knowledgeBaseId="kb-1"
        vectorStoreId="vs_abc123"
        onKnowledgeBaseChange={onKnowledgeBaseChange}
        {...props}
      />
    </MockedProvider>
  );
  return { onKnowledgeBaseChange };
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
  renderTab();

  const big = new File(['x'], 'huge.pdf', { type: 'application/pdf' });
  Object.defineProperty(big, 'size', { value: 21 * 1024 * 1024 });
  pickFile(big);

  expect(notificationSpy).toHaveBeenCalledWith(expect.stringContaining('huge.pdf'), 'warning');
  expect(screen.queryByTestId('uploadingFile')).not.toBeInTheDocument();
  notificationSpy.mockRestore();
});

test('uploads a file, rebuilds the knowledge base, and reports the new version', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
  const newFile = { fileId: 'file-2', filename: 'guide.pdf', uploadedAt: '2026-08-04T10:00:00Z', fileSize: 2048 };

  const { onKnowledgeBaseChange } = renderTab({}, [
    uploadMock('guide.pdf', 'file-2'),
    rebuildMock([existingFile, newFile]),
  ]);

  pickFile(new File(['x'], 'guide.pdf', { type: 'application/pdf' }));

  expect(screen.getByTestId('uploadingFile')).toHaveTextContent('guide.pdf');

  await waitFor(() => {
    expect(onKnowledgeBaseChange).toHaveBeenCalledWith('kbv-2', [existingFile, newFile]);
  });
  expect(screen.getAllByTestId('knowledgeBaseFile')).toHaveLength(2);
  expect(screen.queryByTestId('uploadingFile')).not.toBeInTheDocument();
  notificationSpy.mockRestore();
});

test('a failed upload is reported and no file is added', async () => {
  const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
  renderTab({}, [
    { request: { query: UPLOAD_FILE_TO_KAAPI }, variableMatcher: () => true, error: new Error('Upload failed') },
  ]);

  pickFile(new File(['x'], 'guide.pdf', { type: 'application/pdf' }));

  await waitFor(() => {
    expect(errorSpy).toHaveBeenCalled();
  });
  expect(screen.getAllByTestId('knowledgeBaseFile')).toHaveLength(1);
  expect(screen.queryByTestId('uploadingFile')).not.toBeInTheDocument();
  errorSpy.mockRestore();
});

test('removing a file asks first, then rebuilds without it', async () => {
  const { onKnowledgeBaseChange } = renderTab({}, [rebuildMock([])]);

  fireEvent.click(screen.getByTestId('removeFileButton'));
  expect(screen.getByText('Remove nutrition_faq.pdf?')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Remove file'));

  await waitFor(() => {
    expect(onKnowledgeBaseChange).toHaveBeenCalledWith('kbv-2', []);
  });
  expect(screen.getByTestId('knowledgeBaseEmpty')).toBeInTheDocument();
});

test('cancelling the remove dialog keeps the file', async () => {
  const { onKnowledgeBaseChange } = renderTab();

  fireEvent.click(screen.getByTestId('removeFileButton'));
  fireEvent.click(screen.getByText('Cancel'));

  await waitFor(() => {
    expect(screen.queryByText('Remove nutrition_faq.pdf?')).not.toBeInTheDocument();
  });
  expect(screen.getByTestId('knowledgeBaseFile')).toBeInTheDocument();
  expect(onKnowledgeBaseChange).not.toHaveBeenCalled();
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
    renderTab({ files: [], vectorStoreId: null, knowledgeBaseId: null });

    fireEvent.click(screen.getByTestId('technicalDetailsToggle'));

    expect(screen.getByTestId('noVectorStore')).toBeInTheDocument();
  });
});
