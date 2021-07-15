import { MockedProvider } from '@apollo/client/testing';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { uploadMediaMock } from '../../../../mocks/Attachment';
import axios from 'axios';
import { AddAttachment } from './AddAttachment';

jest.mock('axios');

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

test('uploading a file', async () => {
  const { getByTestId } = render(addAttachment('IMAGE'));
  const file = { name: 'photo.png' };

  fireEvent.change(getByTestId('uploadFile'), { target: { files: [file] } });

  await waitFor(() => {
    expect(setAttachmentURL).toHaveBeenCalled();
  });
});

// Need to clean previous test cases renders

// test('add an attachment', async () => {
//   const { getByTestId, getByText } = render(addAttachment('IMAGE', 'https://glific.com'));
//   const responseData = { data: { is_valid: true } };
//   act(() => {
//     axios.get.mockImplementationOnce(() => Promise.resolve(responseData));
//   });
//   fireEvent.click(getByTestId('ok-button'));

//   await waitFor(() => {
//     expect(setAttachmentAdded).toHaveBeenCalled();
//   });
// });

// test('attachment is invalid', async () => {
//   const { getByTestId, getByText } = render(addAttachment('IMAGE', 'https://glific.com'));
//   const responseData = { data: { is_valid: false, message: 'Content type not valid' } };
//   act(() => {
//     axios.get.mockImplementationOnce(() => Promise.resolve(responseData));
//   });
//   fireEvent.click(getByTestId('ok-button'));

//   await waitFor(() => {
//     expect(getByText('Content type not valid')).toBeInTheDocument();
//   });
// });

test('it should reset type if cross icon is clicked', () => {
  const { getByTestId } = render(addAttachment('IMAGE'));
  fireEvent.click(getByTestId('crossIcon'));
  expect(setAttachmentType).toHaveBeenCalled();
});

test('should get error if the type is not present', async () => {
  const { getByText, getByTestId } = render(addAttachment());
  fireEvent.click(getByTestId('ok-button'));
  await waitFor(() => {
    expect(getByText('Type is required.')).toBeInTheDocument();
  });
});

test('cancel button', () => {
  const { getByTestId } = render(addAttachment());
  fireEvent.click(getByTestId('cancel-button'));

  expect(setAttachment).toHaveBeenCalled();
});

test('show warnings if attachment type is audio', async () => {
  const { getByText } = render(addAttachment('AUDIO', 'https://glific.com'));

  expect(getByText('Captions along with audio are not supported.')).toBeInTheDocument();
});

test('show warnings if attachment type is sticker', async () => {
  const { getByText } = render(addAttachment('STICKER', 'https://glific.com'));
  expect(getByText('Animated stickers are not supported.')).toBeInTheDocument();
});
