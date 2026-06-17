import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as Notification from 'common/notification';
import { generatedPromptText, promptGeneratorErrorMocks, promptGeneratorSuccessMocks } from 'mocks/PromptGenerator';

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

test('renders the wizard with a progress bar and first question', async () => {
  renderModal();

  expect(screen.getByText('Generate Prompt with AI')).toBeInTheDocument();
  expect(screen.getByTestId('progressBar')).toBeInTheDocument();
  expect(screen.getByText('Organisation & chatbot name')).toBeInTheDocument();
  expect(screen.getByText('Step 1 / 9')).toBeInTheDocument();
});

test('can advance steps and fill partial answers', async () => {
  renderModal();

  // fill first answer
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Pratham' } });
  fireEvent.click(screen.getByTestId('nextButton'));

  await waitFor(() => {
    expect(screen.getByText('What does the assistant help with?')).toBeInTheDocument();
    expect(screen.getByText('Step 2 / 9')).toBeInTheDocument();
  });

  // go back
  fireEvent.click(screen.getByTestId('backButton'));
  await waitFor(() => {
    expect(screen.getByText('Step 1 / 9')).toBeInTheDocument();
  });
  // value preserved
  expect(screen.getByRole('textbox')).toHaveValue('Pratham');
});

test('generates a prompt, polls to ready and shows the editable preview', async () => {
  renderModal();

  // advance to the last step (9 questions, click Next 8 times)
  for (let i = 0; i < 8; i += 1) {
    fireEvent.click(screen.getByTestId('nextButton'));
  }

  await waitFor(() => {
    expect(screen.getByTestId('generatePromptButton')).toBeInTheDocument();
  });

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

  for (let i = 0; i < 8; i += 1) {
    fireEvent.click(screen.getByTestId('nextButton'));
  }
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

  for (let i = 0; i < 8; i += 1) {
    fireEvent.click(screen.getByTestId('nextButton'));
  }
  fireEvent.click(screen.getByTestId('generatePromptButton'));

  await waitFor(() => {
    expect(screen.getByTestId('promptError')).toBeInTheDocument();
    expect(errorMessageSpy).toHaveBeenCalled();
  });

  // retry returns to the wizard
  fireEvent.click(screen.getByTestId('retryButton'));
  await waitFor(() => {
    expect(screen.getByTestId('generatePromptButton')).toBeInTheDocument();
  });
});
