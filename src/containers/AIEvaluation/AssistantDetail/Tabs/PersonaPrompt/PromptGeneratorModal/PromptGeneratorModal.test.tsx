import { useState } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen } from '@testing-library/react';

import * as Notification from 'common/notification';
import {
  generatedPromptText,
  promptGeneratorErrorMocks,
  promptGeneratorFailedStatusMocks,
  promptGeneratorPollFailedMocks,
  promptGeneratorReadyEmptyMocks,
  promptGeneratorSuccessMocks,
  sampleAnswers,
} from 'mocks/PromptGenerator';

import { initialPromptAnswers, PromptAnswers, PromptGeneratorModal } from './PromptGeneratorModal';

const errorMessageSpy = vi.spyOn(Notification, 'setErrorMessage');

// jsdom doesn't implement scrollIntoView; the modal calls it to jump to the first gap
Element.prototype.scrollIntoView = vi.fn();

// The modal polls on a real 2s interval with a 20s timeout. Driving those with the
// real clock makes the suite slow and flaky under CI load (event-loop starvation can
// race waitFor against the poll), so we run the async tests on a fake clock and advance
// it deterministically — the generation flow then resolves on demand, not on wall-time.
const POLL_INTERVAL = 2000;

// flush the mutation promise + any scheduled poll ticks/timeouts on the fake clock
const advanceGeneration = async (ms: number = POLL_INTERVAL * 3) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

const onClose = vi.fn();
const onApply = vi.fn();

// the answers are owned by the parent page, so the test wraps the modal in a stateful
// harness that holds them (mirroring CreateAssistant)
const Harness = ({ initial = initialPromptAnswers }: { initial?: PromptAnswers }) => {
  const [answers, setAnswers] = useState<PromptAnswers>(initial);
  return <PromptGeneratorModal open onClose={onClose} onApply={onApply} answers={answers} setAnswers={setAnswers} />;
};

const renderModal = (mocks: any = promptGeneratorSuccessMocks, initial?: PromptAnswers) =>
  render(
    <MockedProvider mocks={mocks}>
      <Harness initial={initial} />
    </MockedProvider>
  );

// fill all 9 mandatory questions, in order, with the mocked answer values.
const fillAllAnswers = () => {
  const inputs = screen.getAllByRole('textbox');
  Object.values(sampleAnswers).forEach((value, index) => {
    fireEvent.change(inputs[index], { target: { value } });
  });
};

test('pre-fills the wizard with answers supplied by the parent page', () => {
  renderModal(promptGeneratorSuccessMocks, sampleAnswers as PromptAnswers);

  expect(screen.getAllByRole('textbox')[0]).toHaveValue(sampleAnswers.name);
  expect(screen.getAllByRole('textbox')[1]).toHaveValue(sampleAnswers.purpose);
});

test('renders the header, beta notice and all 9 questions as a single form', () => {
  renderModal();

  expect(screen.getByText(/Generate Prompt with AI/)).toBeInTheDocument();
  expect(screen.getByText('Beta')).toBeInTheDocument();
  expect(screen.getByText('Answer 9 questions to get a tailored assistant prompt')).toBeInTheDocument();

  expect(screen.getByTestId('betaBanner')).toBeInTheDocument();
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('Escalation')).toBeInTheDocument();
  expect(screen.getAllByRole('textbox')).toHaveLength(9);
});

test('Generate validates gaps before generating and tracks progress', () => {
  renderModal();

  expect(screen.getByTestId('answeredCount')).toHaveTextContent('0/9 answered');

  // clicking with gaps surfaces the error and does not start generating
  fireEvent.click(screen.getByTestId('generatePromptButton'));
  expect(screen.queryByTestId('generatingState')).not.toBeInTheDocument();
  expect(screen.getByTestId('betaBanner')).toBeInTheDocument();

  fillAllAnswers();
  expect(screen.getByTestId('answeredCount')).toHaveTextContent('9/9 answered');
});

test('Clear resets all answers', () => {
  renderModal();

  fillAllAnswers();
  expect(screen.getAllByRole('textbox')[0]).toHaveValue(sampleAnswers.name);
  expect(screen.getByTestId('answeredCount')).toHaveTextContent('9/9 answered');

  fireEvent.click(screen.getByTestId('clearAnswersButton'));

  expect(screen.getAllByRole('textbox')[0]).toHaveValue('');
  expect(screen.getByTestId('answeredCount')).toHaveTextContent('0/9 answered');
});

test('generates a prompt, polls to ready and shows the editable preview', async () => {
  renderModal();

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));

  // phase flips to 'generating' synchronously on click, before the mutation resolves
  expect(screen.getByTestId('generatingState')).toBeInTheDocument();

  await advanceGeneration();

  expect(screen.getByTestId('reviewNotice')).toBeInTheDocument();
  expect(screen.getByTestId('generatedPromptInput')).toHaveValue(generatedPromptText);
});

test('editing the preview and clicking Use this Prompt calls onApply with edited text', async () => {
  renderModal();

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));
  await advanceGeneration();

  fireEvent.change(screen.getByTestId('generatedPromptInput'), { target: { value: 'Edited prompt text' } });
  fireEvent.click(screen.getByTestId('usePromptButton'));

  expect(onApply).toHaveBeenCalledWith('Edited prompt text');
});

test('shows error state with retry when generation fails', async () => {
  renderModal(promptGeneratorErrorMocks);

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));
  await advanceGeneration();

  expect(screen.getByTestId('promptError')).toBeInTheDocument();
  expect(errorMessageSpy).toHaveBeenCalled();

  // retry returns to the form
  fireEvent.click(screen.getByTestId('retryButton'));
  expect(screen.getByTestId('generatePromptButton')).toBeInTheDocument();
});

test('shows error when the mutation returns a failed status directly', async () => {
  renderModal(promptGeneratorFailedStatusMocks);

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));
  await advanceGeneration();

  expect(screen.getByTestId('promptError')).toBeInTheDocument();
});

test('treats a ready response with no prompt text as a failure', async () => {
  renderModal(promptGeneratorReadyEmptyMocks);

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));
  await advanceGeneration();

  expect(screen.getByTestId('promptError')).toBeInTheDocument();
});

test('shows error when polling resolves to a failed status', async () => {
  renderModal(promptGeneratorPollFailedMocks);

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));
  await advanceGeneration();

  expect(screen.getByTestId('promptError')).toBeInTheDocument();
});
