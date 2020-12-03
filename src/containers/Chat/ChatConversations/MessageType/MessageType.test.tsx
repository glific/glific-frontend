import { render } from '@testing-library/react';
import React from 'react';

import { MessageType } from './MessageType';

test('it should render', () => {
  const { getByTestId } = render(<MessageType type="IMAGE" />);

  expect(getByTestId('messageType')).toBeInTheDocument();
});

test('display message if type is text', () => {
  const { getByText } = render(<MessageType type="TEXT" body="Hey" />);
  expect(getByText('Hey')).toBeInTheDocument();
});

test('display Type if type is Image', () => {
  const { getByText } = render(<MessageType type="IMAGE" />);
  expect(getByText('Image')).toBeInTheDocument();
});

test('display Type if type is Video', () => {
  const { getByText } = render(<MessageType type="VIDEO" />);
  expect(getByText('Video')).toBeInTheDocument();
});

test('display Type if type is Audio', () => {
  const { getByText } = render(<MessageType type="AUDIO" />);
  expect(getByText('Audio')).toBeInTheDocument();
});

test('display Type if type is Sticker', () => {
  const { getByText } = render(<MessageType type="STICKER" />);
  expect(getByText('Sticker')).toBeInTheDocument();
});

test('display Type if type is Document', () => {
  const { getByText } = render(<MessageType type="DOCUMENT" />);
  expect(getByText('Document')).toBeInTheDocument();
});

test('display Type if type is Default', () => {
  const { getByText } = render(<MessageType type="Other Type" />);
  expect(getByText('Other Type')).toBeInTheDocument();
});
