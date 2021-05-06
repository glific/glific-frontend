import { MockedProvider } from '@apollo/client/testing';
import {
  cleanup,
  fireEvent,
  getByText,
  render,
  waitFor,
  waitForDomChange,
} from '@testing-library/react';
import { uploadMediaMock } from '../../../../mocks/Attachment';

import { AddAttachment } from './AddAttachment';

const setAttachment = jest.fn();
const setAttachmentURL = jest.fn();
const setAttachmentAdded = jest.fn();
const setAttachmentType = jest.fn();

beforeEach(() => {
  cleanup();
});
const mocks = [uploadMediaMock, uploadMediaMock];

const addAttachment = (attachmentType = '', attachmentURL = '') => {
  const defaultProps = {
    setAttachment,
    setAttachmentURL,
    setAttachmentAdded,
    setAttachmentType,
    attachmentURL,
    attachmentType,
    uploadPermission: true,
  };
  return (
    <MockedProvider mocks={mocks}>
      <AddAttachment {...defaultProps} />
    </MockedProvider>
  );
};

test('it should render', () => {
  const { getByTestId } = render(addAttachment());
  expect(getByTestId('attachmentDialog')).toBeInTheDocument();
});

test('it should reset type if cross icon is clicked', () => {
  const { getByTestId } = render(addAttachment('IMAGE'));
  fireEvent.click(getByTestId('crossIcon'));
  expect(setAttachmentType).toHaveBeenCalled();
});

test('should get error if the type is not present', async () => {
  const { getByText, getByTestId } = render(addAttachment());
  fireEvent.click(getByTestId('ok-button'));
  waitFor(() => {
    expect(getByText('Type is required.')).toBeInTheDocument();
  });
});

test('cancel button', () => {
  const { getByTestId } = render(addAttachment());
  fireEvent.click(getByTestId('cancel-button'));

  expect(setAttachment).toHaveBeenCalled();
});

test('add an attachment', async () => {
  const { getByTestId } = render(addAttachment('IMAGE', 'https://glific.com'));
  fireEvent.click(getByTestId('ok-button'));
  waitFor(() => {
    expect(setAttachmentAdded).toHaveBeenCalled();
  });
});

test('show warnings if attachment type is audio', async () => {
  const { getByText } = render(addAttachment('AUDIO', 'https://glific.com'));

  expect(getByText('Captions along with audio are not supported.')).toBeInTheDocument();
});

test('show warnings if attachment type is sticker', async () => {
  const { getByText } = render(addAttachment('STICKER', 'https://glific.com'));
  expect(getByText('Animated stickers are not supported.')).toBeInTheDocument();
});

test('uploading a file', async () => {
  const { getByTestId, getByText } = render(addAttachment('IMAGE'));
  const file = new File(['Hello glific'], 'glific.txt', {
    type: 'text/plain',
  });

  fireEvent.change(getByTestId('uploadFile'), { target: { files: [file] } });

  await waitFor(() => {});

  await waitFor(() => {
    expect(getByText('Image')).toBeInTheDocument();
  });
});
