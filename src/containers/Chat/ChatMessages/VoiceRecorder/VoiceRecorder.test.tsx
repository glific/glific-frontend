import { VoiceRecorder } from './VoiceRecorder';
import { fireEvent, render, waitFor } from '@testing-library/react';
import * as useReactMediaRecorder from 'react-media-recorder/';
import { useState } from 'react';
import { ReactMediaRecorderRenderProps } from 'react-media-recorder/';

const handleAudioRecordingMock = jest.fn();
const defaultProps = {
  handleAudioRecording: handleAudioRecordingMock,
  clearAudio: false,
  isMicActive: false,
};

afterEach(() => jest.restoreAllMocks());

const voiceRecorder = <VoiceRecorder {...defaultProps} />;

test('it renders correctly', () => {
  const mediaRecorder = jest.spyOn(useReactMediaRecorder, 'useReactMediaRecorder');
  mediaRecorder.mockImplementation((props: any) => {
    return {
      status: 'idle',
    } as ReactMediaRecorderRenderProps;
  });
  const { getByTestId } = render(voiceRecorder);
  expect(getByTestId('recorder')).toBeInTheDocument();
});

test('check recording', async () => {
  const mediaRecorder = jest.spyOn(useReactMediaRecorder, 'useReactMediaRecorder');
  mediaRecorder.mockImplementation(({ onStop }: any) => {
    const [status, setStatus] = useState('idle');
    return {
      status: status,
      startRecording: () => {
        setStatus('recording');
      },
      stopRecording: () => {
        setStatus('stop');
        onStop();
      },
      mediaBlobUrl: 'blog://heythere',
      clearBlobUrl: jest.fn(),
    };
  });
  const { getByTestId } = render(voiceRecorder);

  // start recording
  fireEvent.click(getByTestId('micIcon'));

  // stop recording
  fireEvent.click(getByTestId('recorder'));

  // still need to check stop recording
  await waitFor(() => {});

  // remove recording
  fireEvent.click(getByTestId('cancelIcon'));

  expect(handleAudioRecordingMock).toHaveBeenCalled();
});

test('permission denied', async () => {
  const mediaRecorder = jest.spyOn(useReactMediaRecorder, 'useReactMediaRecorder');
  mediaRecorder.mockImplementation(() => {
    return {
      error: 'permission_denied',
    };
  });
  const { getByTestId } = render(<VoiceRecorder {...defaultProps} />);
  await waitFor(() => {
    expect(getByTestId('micOffIcon')).toBeInTheDocument();
  });
});
