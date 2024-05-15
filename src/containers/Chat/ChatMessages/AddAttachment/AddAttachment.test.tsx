import { MockedProvider } from '@apollo/client/testing';
import { cleanup, fireEvent, render, waitFor, screen, act } from '@testing-library/react';
import axios from 'axios';
import { vi } from 'vitest';

import { uploadMediaMock, uploadMediaErrorMock } from 'mocks/Attachment';
import { AddAttachment } from './AddAttachment';
import { setNotification } from 'common/notification';

vi.mock('axios');
const mockedAxios = axios as any;

const setAttachment = vi.fn();
const setAttachmentURL = vi.fn();
const setAttachmentAdded = vi.fn();
const setAttachmentType = vi.fn();

beforeEach(() => {
  cleanup();
});
const mocks = [uploadMediaMock];

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

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn((...args) => args[1]),
  };
});

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

test('add a valid attachment', async () => {
  const responseData = { data: { is_valid: true } };
  act(() => {
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(responseData));
  });
  render(addAttachment('IMAGE', 'https://glific.com'));

  await waitFor(() => {
    expect(setAttachmentAdded).toHaveBeenCalled();
  });
});

test('attachment is invalid', async () => {
  const responseData = { data: { is_valid: false, message: 'Content type not valid' } };
  act(() => {
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(responseData));
  });

  render(addAttachment('IMAGE', 'https://glific.com'));

  await waitFor(() => {
    expect(screen.getByText('Content type not valid')).toBeInTheDocument();
  });
});

test('it should reset type if cross icon is clicked', () => {
  const { getByTestId } = render(addAttachment('IMAGE'));
  fireEvent.click(getByTestId('crossIcon'));
  expect(setAttachmentURL).toHaveBeenCalled();
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

test('should get error notification if uploading media fails', async () => {
  const defaultProps = {
    setAttachment,
    setAttachmentURL,
    setAttachmentAdded,
    setAttachmentType,
    attachmentURL: '',
    attachmentType: 'IMAGE',
    uploadPermission: true,
  };
  render(
    <MockedProvider mocks={[uploadMediaErrorMock]}>
      <AddAttachment {...defaultProps} />
    </MockedProvider>
  );

  const file = { name: 'photo.png' };

  fireEvent.change(screen.getByTestId('uploadFile'), { target: { files: [file] } });

  await waitFor(() => {
    expect(setNotification).toHaveReturnedWith('warning');
  });
});

test('successful media submission', async () => {
  const responseData = { data: { is_valid: true } };
  act(() => {
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(responseData));
  });
  render(addAttachment('IMAGE', 'https://glific.com'));

  // let url validation complete
  await waitFor(() => {
    expect(
      screen.queryByText('Please wait for the attachment URL verification')
    ).not.toBeInTheDocument();
  });

  await waitFor(() => {
    fireEvent.click(screen.getByTestId('ok-button'));
  });
  await waitFor(() => {
    expect(setAttachmentType).toHaveBeenCalledWith('IMAGE');
    expect(setAttachmentURL).toHaveBeenCalledWith('https://glific.com');
    expect(setAttachment).toHaveBeenCalledWith(false);
  });
});
