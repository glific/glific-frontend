import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as Notification from 'common/notification';
import {
  generatedPromptText,
  promptGeneratorErrorMocks,
  promptGeneratorSuccessMocks,
  sampleAnswers,
} from 'mocks/PromptGenerator';

import { PromptGeneratorModal } from './PromptGeneratorModal';

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

// fill all 9 mandatory questions, in order, with the mocked answer values
const fillAllAnswers = () => {
  const inputs = screen.getAllByRole('textbox');
  Object.values(sampleAnswers).forEach((value, index) => {
    fireEvent.change(inputs[index], { target: { value } });
  });
};

test('renders the header, beta notice and all 9 questions as a single form', () => {
  renderModal();

  expect(screen.getByText(/Generate Prompt with AI/)).toBeInTheDocument();
  expect(screen.getByText('BETA')).toBeInTheDocument();
  expect(screen.getByText('Answer 9 questions to get a tailored assistant prompt')).toBeInTheDocument();
  expect(screen.getByTestId('betaBanner')).toBeInTheDocument();

  // all 9 questions are visible at once (no stepper)
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
