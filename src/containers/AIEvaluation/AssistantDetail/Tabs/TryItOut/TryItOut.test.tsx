import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';
import TryItOut from './TryItOut';

const defaultProps = {
  hasVersions: true,
  isDirty: false,
  versionId: 'v2',
  versionNumber: 2,
  versionStatus: 'ready',
  liveVersionNumber: 1,
  onGoToPersona: vi.fn(),
  onSave: vi.fn(),
  onRunEvaluation: vi.fn(),
};

const renderTab = (props: Partial<Parameters<typeof TryItOut>[0]> = {}) => {
  const handlers = {
    onGoToPersona: vi.fn(),
    onSave: vi.fn(),
    onRunEvaluation: vi.fn(),
  };
  const view = render(<TryItOut {...defaultProps} {...handlers} {...props} />);
  return { ...handlers, ...view };
};

const type = (text: string) => fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: text } });

describe('blocked states', () => {
  test('an assistant with no versions is pointed at Persona & Prompt', () => {
    const { onGoToPersona } = renderTab({ hasVersions: false });

    expect(screen.getByTestId('tryItOutBlocker')).toHaveTextContent('Save your first version to try it out');
    expect(screen.queryByTestId('sandboxInput')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('goToPersonaButton'));
    expect(onGoToPersona).toHaveBeenCalled();
  });

  test('unsaved changes block testing, and the blocker can save', () => {
    const { onSave } = renderTab({ isDirty: true });

    expect(screen.getByTestId('tryItOutBlocker')).toHaveTextContent('Save a version to try it out');
    expect(screen.getByTestId('tryItOutBlocker')).toHaveTextContent('not what');

    fireEvent.click(screen.getByTestId('saveFromTryItOutButton'));
    expect(onSave).toHaveBeenCalled();
  });

  test('a version still building cannot be tested', () => {
    renderTab({ versionStatus: 'in_progress' });

    expect(screen.getByTestId('tryItOutBlocker')).toHaveTextContent('This version is still being prepared');
    expect(screen.queryByTestId('sandboxInput')).not.toBeInTheDocument();
  });

  test('a failed version cannot be tested', () => {
    renderTab({ versionStatus: 'failed' });

    expect(screen.getByTestId('tryItOutBlocker')).toHaveTextContent('This version failed to build');
  });

  test('no versions wins over unsaved changes', () => {
    renderTab({ hasVersions: false, isDirty: true });

    expect(screen.getByTestId('tryItOutBlocker')).toHaveTextContent('Save your first version');
  });
});

describe('the sandbox', () => {
  test('says which version is being tested and which one real users get', () => {
    renderTab();

    expect(screen.getByTestId('testingNote')).toHaveTextContent('Testing Version 2');
    expect(screen.getByTestId('testingNote')).toHaveTextContent('real users stay on Version 1');
  });

  test('says nothing is live when no version has been published', () => {
    renderTab({ liveVersionNumber: null });

    expect(screen.getByTestId('testingNote')).toHaveTextContent('nothing is live yet');
  });

  test('without a send endpoint you can still type, but nothing is sent', () => {
    renderTab();

    expect(screen.getByTestId('sandboxUnavailable')).toBeInTheDocument();

    // the box accepts input so the composer does not look broken
    type('Is it safe?');
    expect(screen.getByTestId('sandboxInput')).toHaveValue('Is it safe?');

    expect(screen.getByTestId('sendMessageButton')).toBeDisabled();
    fireEvent.keyDown(screen.getByTestId('sandboxInput'), { key: 'Enter' });
    expect(screen.queryByTestId('userMessage')).not.toBeInTheDocument();

    // the sample link would send, so it is not offered either
    expect(screen.queryByTestId('sampleQuestionButton')).not.toBeInTheDocument();
  });

  test('sends a message and shows the reply', async () => {
    const onSendMessage = vi.fn().mockResolvedValue('Yes, in most cases.');
    renderTab({ onSendMessage });

    expect(screen.getByTestId('sandboxEmpty')).toBeInTheDocument();

    type('Is it safe?');
    fireEvent.click(screen.getByTestId('sendMessageButton'));

    expect(screen.getByTestId('userMessage')).toHaveTextContent('Is it safe?');
    expect(screen.getByTestId('pendingMessage')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('assistantMessage')).toHaveTextContent('Yes, in most cases.');
    });
    expect(onSendMessage).toHaveBeenCalledWith('Is it safe?');
    // the composer is cleared and usable again
    expect(screen.getByTestId('sandboxInput')).toHaveValue('');
    expect(screen.queryByTestId('pendingMessage')).not.toBeInTheDocument();
  });

  test('Enter sends too', async () => {
    const onSendMessage = vi.fn().mockResolvedValue('Sure.');
    renderTab({ onSendMessage });

    type('Hello');
    fireEvent.keyDown(screen.getByTestId('sandboxInput'), { key: 'Enter' });

    await waitFor(() => {
      expect(onSendMessage).toHaveBeenCalledWith('Hello');
    });
  });

  test('blank and whitespace-only messages are not sent', () => {
    const onSendMessage = vi.fn();
    renderTab({ onSendMessage });

    expect(screen.getByTestId('sendMessageButton')).toBeDisabled();

    type('   ');
    expect(screen.getByTestId('sendMessageButton')).toBeDisabled();
    fireEvent.keyDown(screen.getByTestId('sandboxInput'), { key: 'Enter' });
    expect(onSendMessage).not.toHaveBeenCalled();
  });

  test('a second send is blocked while the first is still pending', async () => {
    let release: (value: string) => void = () => {};
    const onSendMessage = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          release = resolve;
        })
    );
    renderTab({ onSendMessage });

    type('First');
    fireEvent.click(screen.getByTestId('sendMessageButton'));

    // the box stays usable so the next question can be typed while waiting
    expect(screen.getByTestId('sandboxInput')).not.toBeDisabled();
    expect(screen.getByTestId('sendMessageButton')).toBeDisabled();

    type('Second');
    fireEvent.keyDown(screen.getByTestId('sandboxInput'), { key: 'Enter' });
    expect(onSendMessage).toHaveBeenCalledTimes(1);

    release('Done');
    await waitFor(() => {
      expect(screen.getByTestId('assistantMessage')).toHaveTextContent('Done');
    });
    expect(onSendMessage).toHaveBeenCalledTimes(1);
  });

  test('a failed send is reported and keeps the question in the transcript', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    const onSendMessage = vi.fn().mockRejectedValue(new Error('Sandbox unavailable'));
    renderTab({ onSendMessage });

    type('Anything there?');
    fireEvent.click(screen.getByTestId('sendMessageButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(screen.getByTestId('userMessage')).toHaveTextContent('Anything there?');
    expect(screen.getByTestId('assistantMessage')).toHaveTextContent('Could not get a reply');
    // still usable afterwards
    expect(screen.getByTestId('sandboxInput')).not.toBeDisabled();
    errorSpy.mockRestore();
  });

  test('the sample question sends a starter message', async () => {
    const onSendMessage = vi.fn().mockResolvedValue('Plenty!');
    renderTab({ onSendMessage });

    fireEvent.click(screen.getByTestId('sampleQuestionButton'));

    await waitFor(() => {
      expect(onSendMessage).toHaveBeenCalledWith('What can you help me with?');
    });
  });

  test('switching version clears the transcript — it belonged to the old one', async () => {
    const onSendMessage = vi.fn().mockResolvedValue('Reply');
    const { rerender } = renderTab({ onSendMessage });

    type('Question');
    fireEvent.click(screen.getByTestId('sendMessageButton'));
    await waitFor(() => {
      expect(screen.getByTestId('assistantMessage')).toBeInTheDocument();
    });

    rerender(<TryItOut {...defaultProps} versionId="v3" versionNumber={3} onSendMessage={onSendMessage} />);

    expect(screen.getByTestId('sandboxEmpty')).toBeInTheDocument();
    expect(screen.queryByTestId('userMessage')).not.toBeInTheDocument();
    expect(screen.getByTestId('testingNote')).toHaveTextContent('Testing Version 3');
  });
});

describe('the evaluation nudge', () => {
  const chat = async (onSendMessage: ReturnType<typeof vi.fn>, count: number) => {
    for (let index = 0; index < count; index += 1) {
      type(`Question ${index}`);
      fireEvent.click(screen.getByTestId('sendMessageButton'));
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => {
        expect(screen.getAllByTestId('assistantMessage')).toHaveLength(index + 1);
      });
    }
  };

  test('appears after two exchanges when Golden Q&A sets exist', async () => {
    const onSendMessage = vi.fn().mockResolvedValue('Reply');
    const { onRunEvaluation } = renderTab({ onSendMessage, hasGoldenQaSets: true });

    await chat(onSendMessage, 1);
    expect(screen.queryByTestId('evaluationNudge')).not.toBeInTheDocument();

    await chat(onSendMessage, 2);
    expect(screen.getByTestId('evaluationNudge')).toHaveTextContent('Happy with these responses?');

    fireEvent.click(screen.getByTestId('runEvaluationButton'));
    expect(onRunEvaluation).toHaveBeenCalled();
  });

  test('stays hidden when there is no Golden Q&A set to run', async () => {
    const onSendMessage = vi.fn().mockResolvedValue('Reply');
    renderTab({ onSendMessage, hasGoldenQaSets: false });

    await chat(onSendMessage, 2);

    expect(screen.queryByTestId('evaluationNudge')).not.toBeInTheDocument();
  });
});
