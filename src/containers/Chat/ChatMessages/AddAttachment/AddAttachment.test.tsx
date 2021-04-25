import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';

import { AddAttachment } from './AddAttachment';

const setAttachment = jest.fn();
const setAttachmentURL = jest.fn();
const setAttachmentAdded = jest.fn();
const setAttachmentType = jest.fn();

beforeEach(() => {
  cleanup();
});

const defaultProps = (attachmentType = '', attachmentURL = '') => ({
  setAttachment,
  setAttachmentURL,
  setAttachmentAdded,
  setAttachmentType,
  attachmentURL,
  attachmentType,
});

test('it should render', () => {
  const { getByTestId } = render(<AddAttachment {...defaultProps()} />);
  expect(getByTestId('attachmentDialog')).toBeInTheDocument();
});

test('it should reset type if cross icon is clicked', () => {
  const { getByTestId } = render(<AddAttachment {...defaultProps('IMAGE')} />);
  fireEvent.click(getByTestId('crossIcon'));
  expect(setAttachmentType).toHaveBeenCalled();
});

test('should get error if the type is not present', async () => {
  const { getByText, getByTestId } = render(<AddAttachment {...defaultProps()} />);
  fireEvent.click(getByTestId('ok-button'));
  waitFor(() => {
    expect(getByText('Type is required.')).toBeInTheDocument();
  });
});

test('cancel button', () => {
  const { getByTestId } = render(<AddAttachment {...defaultProps()} />);
  fireEvent.click(getByTestId('cancel-button'));

  expect(setAttachment).toHaveBeenCalled();
});

test('add an attachment', async () => {
  const { getByTestId } = render(
    <AddAttachment {...defaultProps('IMAGE', 'https://glific.com')} />
  );
  fireEvent.click(getByTestId('ok-button'));
  waitFor(() => {
    expect(setAttachmentAdded).toHaveBeenCalled();
  });
});

test('show warnings if attachment type is audio', async () => {
  const { getByText } = render(<AddAttachment {...defaultProps('AUDIO', 'https://glific.com')} />);
  expect(getByText('Captions along with audio are not supported.')).toBeInTheDocument();
});

test('show warnings if attachment type is sticker', async () => {
  const { getByText } = render(
    <AddAttachment {...defaultProps('STICKER', 'https://glific.com')} />
  );
  expect(getByText('Animated stickers are not supported.')).toBeInTheDocument();
});
