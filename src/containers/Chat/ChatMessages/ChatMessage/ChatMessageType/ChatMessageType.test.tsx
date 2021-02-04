import React from 'react';
import { render } from '@testing-library/react';
import ChatMessageType from './ChatMessageType';

const defaultProps = (type: string) => {
  return {
    type,
    body: 'Default body',
    media: {
      thumbnail: '',
      url: '',
    },
    insertedAt: '2020-06-25T13:36:43Z',
  };
};

test('it shows image when type of message is image', () => {
  const { getByTestId } = render(<ChatMessageType {...defaultProps('IMAGE')} />);
  expect(getByTestId('imageMessage')).toBeInTheDocument();
});

test('it loads audio when type of message is audio', () => {
  const { getByTestId } = render(<ChatMessageType {...defaultProps('AUDIO')} />);

  expect(getByTestId('audioMessage')).toBeInTheDocument();
});

test('it loads video when type of message is video', () => {
  const { getByTestId } = render(<ChatMessageType {...defaultProps('VIDEO')} />);
  expect(getByTestId('videoMessage')).toBeInTheDocument();
});

test('it loads document when type of message is document', () => {
  const { getByTestId } = render(<ChatMessageType {...defaultProps('DOCUMENT')} />);
  expect(getByTestId('documentMessage')).toBeInTheDocument();
});

test('it loads document when type of message is sticker', () => {
  const { getByTestId } = render(<ChatMessageType {...defaultProps('STICKER')} />);
  expect(getByTestId('stickerMessage')).toBeInTheDocument();
});
