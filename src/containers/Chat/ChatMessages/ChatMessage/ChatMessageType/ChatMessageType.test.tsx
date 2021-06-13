import { fireEvent, render } from '@testing-library/react';
import ChatMessageType from './ChatMessageType';
import * as Img from 'react-image';

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
  };
};

jest.mock('react-viewer', () => (props) => {
  const { onClose } = props;
  return <div data-testid="reactViewer" onClick={() => onClose()} />;
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
  const props = defaultProps('IMAGE');
  props.media = null;
  const { getByText } = render(<ChatMessageType {...props} />);
  expect(getByText('Default body')).toBeInTheDocument();
});

test('show image on viewer', async () => {
  const props = defaultProps('IMAGE');
  props.media.url = 'https://google.com';
  const spy = jest.spyOn(Img, 'Img');

  spy.mockImplementation((props: any) => {
    const { onClick } = props;
    return <img data-testid="mock-image" onClick={() => onClick()}></img>;
  });
  const { getByTestId } = render(<ChatMessageType {...defaultProps('IMAGE')} />);
  //opens the image with react viewer
  fireEvent.click(getByTestId('mock-image'));

  expect(getByTestId('reactViewer')).toBeInTheDocument();
  fireEvent.click(getByTestId('reactViewer'));
});
