import { render } from '@testing-library/react';

import { MessageType } from './MessageType';

test('it should render', () => {
  const { getByTestId, rerender } = render(<MessageType type="IMAGE" />);
  expect(getByTestId('messageType')).toBeInTheDocument();
  rerender(<MessageType type="IMAGE" color="dark" />);
});

test('display message if type is text', () => {
  const { getByText, rerender } = render(<MessageType type="TEXT" body="Hey" />);
  expect(getByText('Hey')).toBeInTheDocument();
  rerender(<MessageType type="TEXT" body="Hey" color="dark" />);
});

test('display type if image', () => {
  const { getByText, rerender } = render(<MessageType type="IMAGE" />);
  expect(getByText('Image')).toBeInTheDocument();
  rerender(<MessageType type="IMAGE" color="dark" />);
});

test('display type if video', () => {
  const { getByText, rerender } = render(<MessageType type="VIDEO" />);
  expect(getByText('Video')).toBeInTheDocument();
  rerender(<MessageType type="VIDEO" color="dark" />);
});

test('display type if audio', () => {
  const { getByText, rerender } = render(<MessageType type="AUDIO" />);
  expect(getByText('Audio')).toBeInTheDocument();
  rerender(<MessageType type="AUDIO" color="dark" />);
});

test('display type if sticker', () => {
  const { getByText, rerender } = render(<MessageType type="STICKER" />);
  expect(getByText('Sticker')).toBeInTheDocument();
  rerender(<MessageType type="STICKER" color="dark" />);
});

test('display type if document', () => {
  const { getByText, rerender } = render(<MessageType type="DOCUMENT" />);
  expect(getByText('Document')).toBeInTheDocument();
  rerender(<MessageType type="DOCUMENT" color="dark" />);
});

test('display type if default', () => {
  const { getByText, rerender } = render(<MessageType type="Other Type" />);
  expect(getByText('Other Type')).toBeInTheDocument();
  rerender(<MessageType type="Other Type" color="dark" />);
});

test('display type if quick reply', () => {
  const { getByText, rerender } = render(<MessageType type="QUICK_REPLY" />);
  expect(getByText('Quick Reply')).toBeInTheDocument();
  rerender(<MessageType type="QUICK_REPLY" color="dark" />);
});

test('display type if list', () => {
  const { getByText, rerender } = render(<MessageType type="LIST" />);
  expect(getByText('List')).toBeInTheDocument();
  rerender(<MessageType type="LIST" color="dark" />);
});
