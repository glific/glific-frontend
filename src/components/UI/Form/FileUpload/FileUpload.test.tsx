import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import { FileUpload } from './FileUpload';

// setupTests mocks react-i18next with `t: (str) => str`, so interpolated copy renders as its
// key. Assert on the key and pin the *behaviour* separately.
const SIZE_ERROR = 'That file is {{size}}KB. Please upload something under {{max}}KB.';
const LIMIT_HINT = 'Up to {{max}}KB.';

const user = userEvent.setup();
const UPLOADED_URL = 'https://storage.googleapis.com/glific/logo.png';

const uploadMock = (media: File) => ({
  request: { query: UPLOAD_MEDIA, variables: { media, extension: 'png' } },
  result: { data: { uploadMedia: UPLOADED_URL } },
});

const setFieldValue = vi.fn();

const renderUpload = ({ field, ...props }: any = {}, mocks: any[] = []) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <FileUpload
        field={{ name: 'logo_url', value: '', ...field }}
        form={{ setFieldValue, touched: {}, errors: {} }}
        maxSizeKb={200}
        accept="image/png,image/jpeg"
        {...props}
      />
    </MockedProvider>
  );

const file = (name: string, type: string, sizeInKb: number) => {
  const uploaded = new File(['x'], name, { type });
  Object.defineProperty(uploaded, 'size', { value: sizeInKb * 1024 });
  return uploaded;
};

describe('<FileUpload />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows an empty state and an Upload button when nothing is set', () => {
    renderUpload();

    expect(screen.getByText('No file uploaded yet.')).toBeInTheDocument();
    expect(screen.getByTestId('uploadButton')).toHaveTextContent('Upload');
    expect(screen.queryByTestId('filePreview')).not.toBeInTheDocument();
  });

  it('previews the stored file and offers to replace it', () => {
    renderUpload({ field: { value: UPLOADED_URL } });

    expect(screen.getByTestId('filePreview')).toHaveAttribute('src', UPLOADED_URL);
    expect(screen.getByTestId('uploadButton')).toHaveTextContent('Replace');
  });

  it('rejects a file over the size limit without uploading it', async () => {
    // No mock is provided, so the mutation firing at all would error the test.
    renderUpload();

    await user.upload(screen.getByTestId('fileInput'), file('big.png', 'image/png', 500));

    await waitFor(() => {
      expect(screen.getByText(SIZE_ERROR)).toBeInTheDocument();
    });
    expect(setFieldValue).not.toHaveBeenCalled();
  });

  it('rejects a file type the provider did not allow', async () => {
    renderUpload();

    // `accept` on the input is only a hint — drag-and-drop and some platforms ignore it, and
    // user.upload honours it, so the change event is fired directly to reach the real check.
    fireEvent.change(screen.getByTestId('fileInput'), {
      target: { files: [file('doc.pdf', 'application/pdf', 10)] },
    });

    await waitFor(() => {
      expect(screen.getByText('That file type is not supported.')).toBeInTheDocument();
    });
    expect(setFieldValue).not.toHaveBeenCalled();
  });

  it('uploads an acceptable file and stores the returned URL', async () => {
    const logo = file('logo.png', 'image/png', 40);
    renderUpload({}, [uploadMock(logo)]);

    await user.upload(screen.getByTestId('fileInput'), logo);

    await waitFor(() => {
      expect(setFieldValue).toHaveBeenCalledWith('logo_url', UPLOADED_URL);
    });
  });

  it('surfaces an upload failure instead of failing silently', async () => {
    const logo = file('logo.png', 'image/png', 40);
    const failing = [
      {
        request: { query: UPLOAD_MEDIA, variables: { media: logo, extension: 'png' } },
        error: new Error('boom'),
      },
    ];
    renderUpload({}, failing);

    await user.upload(screen.getByTestId('fileInput'), logo);

    await waitFor(() => {
      expect(screen.getByText('An error occurred while uploading the file.')).toBeInTheDocument();
    });
    expect(setFieldValue).not.toHaveBeenCalled();
  });

  it('clears the stored file', async () => {
    renderUpload({ field: { value: UPLOADED_URL } });

    await user.click(screen.getByTestId('removeFile'));

    expect(setFieldValue).toHaveBeenCalledWith('logo_url', '');
  });

  it('states the limit so an admin knows before picking a file', () => {
    renderUpload();

    expect(screen.getByText(LIMIT_HINT)).toBeInTheDocument();
  });
});
