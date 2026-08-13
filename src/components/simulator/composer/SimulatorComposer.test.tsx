import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import { SimulatorComposer } from './SimulatorComposer';

const file = new File(['x'], 'photo.png', { type: 'image/png' });

const uploadMock = {
  request: { query: UPLOAD_MEDIA, variables: { media: file, extension: 'png' } },
  result: { data: { uploadMedia: 'https://gcs.test.com/photo.png' } },
};

const handlers = () => ({
  onSendText: vi.fn(),
  onSendMedia: vi.fn(),
  onSendLocation: vi.fn(),
});

const renderComposer = (props: any, mocks: any[] = []) =>
  render(
    <MockedProvider mocks={mocks}>
      <SimulatorComposer {...props} />
    </MockedProvider>
  );

beforeEach(() => vi.clearAllMocks());

describe('SimulatorComposer', () => {
  test('sends typed text and clears the input', () => {
    const props = handlers();
    renderComposer(props);

    fireEvent.change(screen.getByTestId('composerInput'), { target: { value: 'hello' } });
    fireEvent.click(screen.getByTestId('composerSend'));

    expect(props.onSendText).toHaveBeenCalledWith('hello');
    expect(screen.getByTestId('composerInput')).toHaveValue('');
  });

  test('never sends an empty message', () => {
    const props = handlers();
    renderComposer(props);

    fireEvent.change(screen.getByTestId('composerInput'), { target: { value: '   ' } });
    fireEvent.click(screen.getByTestId('composerSend'));

    expect(props.onSendText).not.toHaveBeenCalled();
  });

  test('uploads a real file and hands back the hosted URL (§13.6)', async () => {
    const props = handlers();
    renderComposer(props, [uploadMock]);

    fireEvent.click(screen.getByTestId('composerAttach'));
    fireEvent.change(screen.getByTestId('simulatorCaption').querySelector('input')!, {
      target: { value: 'a photo' },
    });
    fireEvent.change(screen.getByTestId('simulatorFileInput'), { target: { files: [file] } });

    await waitFor(() => {
      expect(props.onSendMedia).toHaveBeenCalledWith({
        type: 'IMAGE',
        url: 'https://gcs.test.com/photo.png',
        caption: 'a photo',
        contentType: 'image/png',
      });
    });
  });

  test('accepts a manually entered location', () => {
    const props = handlers();
    renderComposer(props);

    fireEvent.click(screen.getByTestId('composerLocation'));
    fireEvent.change(screen.getByTestId('simulatorLatitude').querySelector('input')!, { target: { value: '12.5' } });
    fireEvent.change(screen.getByTestId('simulatorLongitude').querySelector('input')!, { target: { value: '77.25' } });
    fireEvent.click(screen.getByTestId('ok-button'));

    expect(props.onSendLocation).toHaveBeenCalledWith({ latitude: 12.5, longitude: 77.25 });
  });

  test('rejects a non-numeric location rather than sending NaN', () => {
    const props = handlers();
    renderComposer(props);

    fireEvent.click(screen.getByTestId('composerLocation'));
    fireEvent.change(screen.getByTestId('simulatorLatitude').querySelector('input')!, { target: { value: 'north' } });
    fireEvent.change(screen.getByTestId('simulatorLongitude').querySelector('input')!, { target: { value: '77.25' } });
    fireEvent.click(screen.getByTestId('ok-button'));

    expect(props.onSendLocation).not.toHaveBeenCalled();
  });

  test('offers only the media types it was given (§13.2 has no STICKER for web)', () => {
    const props = handlers();
    renderComposer({ ...props, mediaTypes: ['IMAGE', 'DOCUMENT'] });

    fireEvent.click(screen.getByTestId('composerAttach'));
    fireEvent.mouseDown(screen.getByTestId('simulatorMediaType').querySelector('[role="combobox"]')!);

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['IMAGE', 'DOCUMENT']);
  });
});
