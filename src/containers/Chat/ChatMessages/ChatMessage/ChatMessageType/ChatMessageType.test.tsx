import { fireEvent, render } from '@testing-library/react';
import * as Img from 'react-image';
import { vi } from 'vitest';

import ChatMessageType from './ChatMessageType';

const defaultProps: any = (type: string) => {
  return {
    type,
    body: 'Default body',
    media: {
      thumbnail: '',
      url: '',
    },
    insertedAt: '2020-06-25T13:36:43Z',
    location: null,
    isContextMessage: true,
  };
};

vi.mock('react-viewer', () => {
  return {
    default: ({ onClose }: any) => <div data-testid="reactViewer" onClick={() => onClose()} />,
  };
});

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

test('it shows the text if type of message is text', () => {
  const { getByText } = render(<ChatMessageType {...defaultProps('TEXT')} />);
  expect(getByText('Default body')).toBeInTheDocument();
});

test('it loads document when type of message is location', () => {
  const props = defaultProps('LOCATION');
  props.location = { latitude: 10, longitude: 20 };
  const { getByTestId } = render(<ChatMessageType {...props} />);
  expect(getByTestId('locationMessage')).toBeInTheDocument();
});

test('check condition if no media object is present', () => {
  const props: any = defaultProps('IMAGE');
  delete props.isContextMessage;
  props.media = null;
  const { getByText } = render(<ChatMessageType {...props} />);
  expect(getByText('Default body')).toBeInTheDocument();
});

test('show image on viewer', async () => {
  const props = defaultProps('IMAGE');
  props.media.url = 'https://google.com';
  const spy = vi.spyOn(Img, 'Img');

  spy.mockImplementation((props: any) => {
    const { onClick } = props;
    return <img data-testid="image-fallback" onClick={() => onClick()}></img>;
  });
  const { getByTestId } = render(<ChatMessageType {...defaultProps('IMAGE')} />);
  //opens the image with react viewer
  fireEvent.click(getByTestId('image-fallback'));

  expect(getByTestId('reactViewer')).toBeInTheDocument();
  fireEvent.click(getByTestId('reactViewer'));
});
