import React from 'react';
import { mount } from 'enzyme';
import ChatMessageType from './ChatMessageType';

const defaultProps = (type: string) => {
  return {
    type: type,
    body: 'Default body',
    media: {
      thumbnail: '',
      url: '',
    },
    insertedAt: '2020-06-25T13:36:43Z',
  };
};

const chatMessageImage = mount(<ChatMessageType {...defaultProps('IMAGE')} />);
const chatMessageVideo = mount(<ChatMessageType {...defaultProps('VIDEO')} />);
const chatMessageDocument = mount(<ChatMessageType {...defaultProps('DOCUMENT')} />);
const chatMessageAudio = mount(<ChatMessageType {...defaultProps('AUDIO')} />);

test('it shows image when type of message is image', () => {
  expect(chatMessageImage.find('[data-testid="imageMessage"]').exists()).toBe(true);
});

test('it loads audio when type of message is audio', () => {
  expect(chatMessageAudio.find('[data-testid="audioMessage"]').exists()).toBe(true);
});

test('it loads video when type of message is video', () => {
  expect(chatMessageVideo.find('[data-testid="videoMessage"]').exists()).toBe(true);
});

test('it loads document when type of message is document', () => {
  expect(chatMessageDocument.find('[data-testid="documentMessage"]').exists()).toBe(true);
});
