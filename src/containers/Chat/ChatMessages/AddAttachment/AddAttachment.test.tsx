import { MockedProvider } from '@apollo/client/testing';
import { cleanup, fireEvent, render, waitFor, screen } from '@testing-library/react';

import { uploadMediaMock } from 'mocks/Attachment';
import { AddAttachment } from './AddAttachment';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

beforeEach(() => {
  mockedAxios.get.mockImplementation(() =>
    Promise.resolve({ data: { is_valid: false, message: 'This media URL is invalid' } })
  );
});

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
//     mockedAxios.get.mockImplementationOnce(() => Promise.resolve(responseData));
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
//     mockedAxios.get.mockImplementationOnce(() => Promise.resolve(responseData));
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

test('show warnings if attachment type is audio', () => {
  render(addAttachment('AUDIO', 'https://glific.com'));
  const helpText = screen.getByText('Captions along with audio are not supported.');
  expect(helpText).toBeInTheDocument();
});

test('show warnings if attachment type is sticker', () => {
  render(addAttachment('STICKER', 'https://glific.com'));
  const helpText = screen.getByText('Animated stickers are not supported.');
  expect(helpText).toBeInTheDocument();
});
