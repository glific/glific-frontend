import { render } from '@testing-library/react';

import { MessageType } from './MessageType';

test('it should render', () => {
  const { getByTestId } = render(<MessageType type="IMAGE" />);

  expect(getByTestId('messageType')).toBeInTheDocument();
});

test('display message if type is text', () => {
  const { getByText } = render(<MessageType type="TEXT" body="Hey" />);
  expect(getByText('Hey')).toBeInTheDocument();
});

test('display type if image', () => {
  const { getByText } = render(<MessageType type="IMAGE" />);
  expect(getByText('Image')).toBeInTheDocument();
});

test('display type if video', () => {
  const { getByText } = render(<MessageType type="VIDEO" />);
  expect(getByText('Video')).toBeInTheDocument();
});

test('display type if audio', () => {
  const { getByText } = render(<MessageType type="AUDIO" />);
  expect(getByText('Audio')).toBeInTheDocument();
});

test('display type if sticker', () => {
  const { getByText } = render(<MessageType type="STICKER" />);
  expect(getByText('Sticker')).toBeInTheDocument();
});

test('display type if document', () => {
  const { getByText } = render(<MessageType type="DOCUMENT" />);
  expect(getByText('Document')).toBeInTheDocument();
});

test('display type if default', () => {
  const { getByText } = render(<MessageType type="Other Type" />);
  expect(getByText('Other Type')).toBeInTheDocument();
});
