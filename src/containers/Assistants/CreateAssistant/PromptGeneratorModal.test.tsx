import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as Notification from 'common/notification';
import {
  generatedPromptText,
  promptGeneratorErrorMocks,
  promptGeneratorPrefillMocks,
  promptGeneratorSuccessMocks,
  sampleAnswers,
} from 'mocks/PromptGenerator';

import { PromptGeneratorModal } from './PromptGeneratorModal';

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

const renderModal = (
  mocks: any = promptGeneratorSuccessMocks,
  props: Partial<Parameters<typeof PromptGeneratorModal>[0]> = {}
) =>
  render(
    <MockedProvider mocks={mocks}>
      <PromptGeneratorModal open onClose={onClose} onApply={onApply} {...props} />
    </MockedProvider>
  );

// fill all 9 mandatory questions, in order, with the mocked answer values.
// Waits for the form first — the modal shows a brief loading state while it fetches
// the user's previous answers.
const fillAllAnswers = async () => {
  const inputs = await screen.findAllByRole('textbox');
  Object.values(sampleAnswers).forEach((value, index) => {
    fireEvent.change(inputs[index], { target: { value } });
  });
};

test('pre-fills the wizard with the user previous answers', async () => {
  renderModal(promptGeneratorPrefillMocks);

  await waitFor(() => {
    expect(screen.getAllByRole('textbox')[0]).toHaveValue(sampleAnswers.name);
  });
  expect(screen.getAllByRole('textbox')[1]).toHaveValue(sampleAnswers.purpose);
});

test('renders the header, beta notice and all 9 questions as a single form', async () => {
  renderModal();

  expect(screen.getByText(/Generate Prompt with AI/)).toBeInTheDocument();
  expect(screen.getByText('BETA')).toBeInTheDocument();
  expect(screen.getByText('Answer 9 questions to get a tailored assistant prompt')).toBeInTheDocument();

  // the form appears once the previous-answers query resolves
  expect(await screen.findByTestId('betaBanner')).toBeInTheDocument();
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('Escalation')).toBeInTheDocument();
  expect(screen.getAllByRole('textbox')).toHaveLength(9);
});

test('Generate is disabled until every mandatory field is answered', async () => {
  renderModal();

  expect(await screen.findByTestId('generatePromptButton')).toBeDisabled();

  await fillAllAnswers();

  expect(screen.getByTestId('generatePromptButton')).toBeEnabled();
});

test('Clear resets all answers', async () => {
  renderModal();

  await fillAllAnswers();
  expect(screen.getAllByRole('textbox')[0]).toHaveValue(sampleAnswers.name);

  fireEvent.click(screen.getByTestId('clearAnswersButton'));

  expect(screen.getAllByRole('textbox')[0]).toHaveValue('');
  expect(screen.getByTestId('generatePromptButton')).toBeDisabled();
});

test('generates a prompt, polls to ready and shows the editable preview', async () => {
  renderModal();

  await fillAllAnswers();
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

  await fillAllAnswers();
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
  expect(mockPosthogCapture).toHaveBeenCalledWith(
    'prompt_applied',
    expect.objectContaining({ edited_in_preview: true })
  );
});

test('shows error state with retry when generation fails', async () => {
  renderModal(promptGeneratorErrorMocks);

  await fillAllAnswers();
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
