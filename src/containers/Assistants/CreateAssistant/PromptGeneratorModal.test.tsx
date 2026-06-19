import { useState } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as Notification from 'common/notification';
import {
  generatedPromptText,
  promptGeneratorErrorMocks,
  promptGeneratorFailedStatusMocks,
  promptGeneratorPollFailedMocks,
  promptGeneratorSuccessMocks,
  sampleAnswers,
} from 'mocks/PromptGenerator';

import { initialPromptAnswers, PromptAnswers, PromptGeneratorModal } from './PromptGeneratorModal';

const mockPosthogCapture = vi.fn();
vi.mock('@posthog/react', () => ({
  usePostHog: () => ({ capture: mockPosthogCapture }),
}));

const errorMessageSpy = vi.spyOn(Notification, 'setErrorMessage');

beforeEach(() => {
  vi.clearAllMocks();
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
  expect(screen.getByText('BETA')).toBeInTheDocument();
  expect(screen.getByText('Answer 9 questions to get a tailored assistant prompt')).toBeInTheDocument();

  expect(screen.getByTestId('betaBanner')).toBeInTheDocument();
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('Escalation')).toBeInTheDocument();
  expect(screen.getAllByRole('textbox')).toHaveLength(9);
});

test('Generate is disabled until every mandatory field is answered', () => {
  renderModal();

  expect(screen.getByTestId('generatePromptButton')).toBeDisabled();

  fillAllAnswers();

  expect(screen.getByTestId('generatePromptButton')).toBeEnabled();
});

test('Clear resets all answers', () => {
  renderModal();

  fillAllAnswers();
  expect(screen.getAllByRole('textbox')[0]).toHaveValue(sampleAnswers.name);

  fireEvent.click(screen.getByTestId('clearAnswersButton'));

  expect(screen.getAllByRole('textbox')[0]).toHaveValue('');
  expect(screen.getByTestId('generatePromptButton')).toBeDisabled();
});

test('generates a prompt, polls to ready and shows the editable preview', async () => {
  renderModal();

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));

  await waitFor(() => {
    expect(screen.getByTestId('generatingState')).toBeInTheDocument();
  });

  await waitFor(
    () => {
      expect(screen.getByTestId('reviewNotice')).toBeInTheDocument();
    },
    { timeout: 5000 }
  );

  expect(screen.getByTestId('generatedPromptInput')).toHaveValue(generatedPromptText);

  // M4: prompt_generated fires once on ready, with a no-PII count
  expect(mockPosthogCapture).toHaveBeenCalledWith(
    'prompt_generated',
    expect.objectContaining({ answers_filled_count: expect.any(Number) })
  );
});

test('editing the preview and clicking Use this Prompt calls onApply with edited text', async () => {
  renderModal();

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));

  await waitFor(
    () => {
      expect(screen.getByTestId('generatedPromptInput')).toBeInTheDocument();
    },
    { timeout: 5000 }
  );

  fireEvent.change(screen.getByTestId('generatedPromptInput'), { target: { value: 'Edited prompt text' } });
  fireEvent.click(screen.getByTestId('usePromptButton'));

  await waitFor(() => {
    expect(onApply).toHaveBeenCalledWith('Edited prompt text');
  });

  // M4: prompt_applied fires on apply, flagging that the preview was edited
  expect(mockPosthogCapture).toHaveBeenCalledWith('prompt_applied', expect.objectContaining({ edited_in_preview: true }));
});

test('shows error state with retry when generation fails', async () => {
  renderModal(promptGeneratorErrorMocks);

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));

  await waitFor(() => {
    expect(screen.getByTestId('promptError')).toBeInTheDocument();
    expect(errorMessageSpy).toHaveBeenCalled();
  });

  // retry returns to the form
  fireEvent.click(screen.getByTestId('retryButton'));
  await waitFor(() => {
    expect(screen.getByTestId('generatePromptButton')).toBeInTheDocument();
  });
});

test('shows error when the mutation returns a failed status directly', async () => {
  renderModal(promptGeneratorFailedStatusMocks);

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));

  await waitFor(() => {
    expect(screen.getByTestId('promptError')).toBeInTheDocument();
  });
});

test('shows error when polling resolves to a failed status', async () => {
  renderModal(promptGeneratorPollFailedMocks);

  fillAllAnswers();
  fireEvent.click(screen.getByTestId('generatePromptButton'));

  await waitFor(
    () => {
      expect(screen.getByTestId('promptError')).toBeInTheDocument();
    },
    { timeout: 5000 }
  );
});
