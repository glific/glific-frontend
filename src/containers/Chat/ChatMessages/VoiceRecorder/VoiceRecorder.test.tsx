import { VoiceRecorder } from './VoiceRecorder';
import { fireEvent, render, waitFor } from '@testing-library/react';
import 'react-media-recorder';

const handleAudioRecordingMock = jest.fn();
const defaultProps = {
  handleAudioRecording: handleAudioRecordingMock,
  clearAudio: false,
};

jest.mock('react-media-recorder', () => {
  return {
    useReactMediaRecorder: ({ audio, onStop }) => {
      let status = 'idle';

      const updateStatus = (newStatus: string) => {
        status = newStatus;
      };
      return {
        status: status,
        startRecording: () => {
          updateStatus('recording');
        },
        stopRecording: () => {
          updateStatus('stop');
          onStop();
        },
        mediaBlobUrl: 'blog://heythere',
        clearBlobUrl: jest.fn(),
      };
    },
  };
});

const voiceRecorder = <VoiceRecorder {...defaultProps} />;

test('it renders correctly', () => {
  const { getByTestId } = render(voiceRecorder);
  expect(getByTestId('recorder')).toBeInTheDocument();
});

test('check recording', async () => {
  const { getByTestId } = render(voiceRecorder);

  // start recording
  fireEvent.click(getByTestId('micIcon'));

  // still need to check stop recording
  await waitFor(() => {});

  // remove recording
  fireEvent.click(getByTestId('cancelIcon'));

  expect(handleAudioRecordingMock).toHaveBeenCalled();
});
