import { VoiceRecorder } from './VoiceRecorder';
import { fireEvent, render, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';

const defaultProps = {
  handleAudioRecording: jest.fn(),
  clearAudio: false,
};

const mockMediaRecorder = {
  start: jest.fn(),
  ondataavailable: jest.fn(),
  onerror: jest.fn(),
  state: '',
  stop: jest.fn(),
};

beforeEach(() => {
  window.MediaRecorder = (jest.fn() as any).mockImplementation(() => mockMediaRecorder);
});

const voiceRecorder = <VoiceRecorder {...defaultProps} />;

test('it renders correctly', () => {
  const { getByTestId } = render(voiceRecorder);
  expect(getByTestId('recorder')).toBeInTheDocument();
});

test('it starts recording', async () => {
  const { getByTestId } = render(voiceRecorder);

  fireEvent.click(getByTestId('micIcon'));

  await waitFor(() => {});
});
