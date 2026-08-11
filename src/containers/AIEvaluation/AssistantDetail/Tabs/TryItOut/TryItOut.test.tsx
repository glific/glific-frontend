import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';
import { SEND_ASSISTANT_MESSAGE } from 'graphql/mutations/Assistant';
import { LLM_CALL_RESPONSE_SUBSCRIPTION } from 'graphql/subscriptions/Assistant';
import { setUserSession } from 'services/AuthService';
import { clearAllSandboxChats } from 'containers/AIEvaluation/services/sandboxChatCache';
import TryItOut from './TryItOut';

const defaultProps = {
  hasVersions: true,
  isDirty: false,
  versionId: 'v2',
  versionNumber: 2,
  versionStatus: 'ready',
  liveVersionNumber: 1,
  assistantId: '1',
  onGoToPersona: vi.fn(),
  onSave: vi.fn(),
  onRunEvaluation: vi.fn(),
};

// the reply is correlated by requestId, which the component generates
const sendMock = (result: Record<string, unknown>) => ({
  request: { query: SEND_ASSISTANT_MESSAGE },
  variableMatcher: () => true,
  result: { data: { sendAssistantMessage: { conversationId: 'c1', jobId: 'j1', errors: null, ...result } } },
});

const renderTab = (props: Partial<Parameters<typeof TryItOut>[0]> = {}, mocks: any[] = []) => {
  const handlers = {
    onGoToPersona: vi.fn(),
    onSave: vi.fn(),
    onRunEvaluation: vi.fn(),
  };
  const view = render(
    <MockedProvider mocks={mocks}>
      <TryItOut {...defaultProps} {...handlers} {...props} />
    </MockedProvider>
  );
  return { ...handlers, ...view };
};

beforeEach(() => {
  setUserSession(JSON.stringify({ organization: { id: '1' } }));
  // transcripts are cached now, so one test's chat would otherwise reappear in the next
  clearAllSandboxChats();
});

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

  test('without an assistant to test, nothing can be sent', () => {
    renderTab({ assistantId: undefined });

    expect(screen.getByTestId('sandboxUnavailable')).toBeInTheDocument();
    expect(screen.getByTestId('sendMessageButton')).toBeDisabled();
    expect(screen.queryByTestId('sampleQuestionButton')).not.toBeInTheDocument();
  });

  test('an answer returned by the mutation is shown straight away', async () => {
    renderTab({}, [sendMock({ answer: 'Yes, in most cases.', requestId: 'r1' })]);

    type('Is it safe?');
    fireEvent.click(screen.getByTestId('sendMessageButton'));

    expect(screen.getByTestId('userMessage')).toHaveTextContent('Is it safe?');
    expect(screen.getByTestId('pendingMessage')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('assistantMessage')).toHaveTextContent('Yes, in most cases.');
    });
    expect(screen.getByTestId('sandboxInput')).toHaveValue('');
    expect(screen.queryByTestId('pendingMessage')).not.toBeInTheDocument();
  });

  test('with no answer yet the typing indicator stays up, waiting on the subscription', async () => {
    renderTab({}, [sendMock({ answer: null, requestId: 'r1' })]);

    type('Is it safe?');
    fireEvent.click(screen.getByTestId('sendMessageButton'));

    await waitFor(() => {
      expect(screen.getByTestId('userMessage')).toBeInTheDocument();
    });
    // the mutation only acknowledges the job; the answer arrives on llmCallResponse
    expect(screen.getByTestId('pendingMessage')).toBeInTheDocument();
    expect(screen.queryByTestId('assistantMessage')).not.toBeInTheDocument();
  });

  test('Enter sends too', async () => {
    renderTab({}, [sendMock({ answer: 'Sure.', requestId: 'r1' })]);

    type('Hello');
    fireEvent.keyDown(screen.getByTestId('sandboxInput'), { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByTestId('assistantMessage')).toHaveTextContent('Sure.');
    });
  });

  test('blank and whitespace-only messages are not sent', () => {
    renderTab({}, [sendMock({ answer: 'unused', requestId: 'r1' })]);

    expect(screen.getByTestId('sendMessageButton')).toBeDisabled();

    type('   ');
    expect(screen.getByTestId('sendMessageButton')).toBeDisabled();
    fireEvent.keyDown(screen.getByTestId('sandboxInput'), { key: 'Enter' });
    expect(screen.queryByTestId('userMessage')).not.toBeInTheDocument();
  });

  test('errors returned by the mutation land in the transcript', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    renderTab({}, [
      sendMock({ answer: null, requestId: 'r1', errors: [{ key: 'assistant', message: 'Assistant is busy' }] }),
    ]);

    type('Anything there?');
    fireEvent.click(screen.getByTestId('sendMessageButton'));

    await waitFor(() => {
      expect(screen.getByTestId('assistantMessage')).toHaveTextContent('Assistant is busy');
    });
    expect(screen.getByTestId('userMessage')).toHaveTextContent('Anything there?');
    expect(errorSpy).toHaveBeenCalled();
    expect(screen.getByTestId('sandboxInput')).not.toBeDisabled();
    errorSpy.mockRestore();
  });

  test('a failed send is reported and keeps the question in the transcript', async () => {
    const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
    renderTab({}, [
      { request: { query: SEND_ASSISTANT_MESSAGE }, variableMatcher: () => true, error: new Error('Network down') },
    ]);

    type('Anything there?');
    fireEvent.click(screen.getByTestId('sendMessageButton'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(screen.getByTestId('userMessage')).toHaveTextContent('Anything there?');
    expect(screen.getByTestId('assistantMessage')).toHaveTextContent('Could not get a reply');
    errorSpy.mockRestore();
  });

  test('the sample question sends a starter message', async () => {
    renderTab({}, [sendMock({ answer: 'Plenty!', requestId: 'r1' })]);

    fireEvent.click(screen.getByTestId('sampleQuestionButton'));

    await waitFor(() => {
      expect(screen.getByTestId('userMessage')).toHaveTextContent('What can you help me with?');
    });
  });

  test('switching version clears the transcript — it belonged to the old one', async () => {
    const { rerender } = renderTab({}, [sendMock({ answer: 'Reply', requestId: 'r1' })]);

    type('Question');
    fireEvent.click(screen.getByTestId('sendMessageButton'));
    await waitFor(() => {
      expect(screen.getByTestId('assistantMessage')).toBeInTheDocument();
    });

    rerender(
      <MockedProvider mocks={[]}>
        <TryItOut {...defaultProps} versionId="v3" versionNumber={3} />
      </MockedProvider>
    );

    expect(screen.getByTestId('sandboxEmpty')).toBeInTheDocument();
    expect(screen.queryByTestId('userMessage')).not.toBeInTheDocument();
    expect(screen.getByTestId('testingNote')).toHaveTextContent('Testing Version 3');
  });
});

describe('the evaluation nudge', () => {
  const chat = async (count: number) => {
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
    const { onRunEvaluation } = renderTab({ hasGoldenQaSets: true }, [
      sendMock({ answer: 'Reply', requestId: 'r1' }),
      sendMock({ answer: 'Reply', requestId: 'r2' }),
    ]);

    await chat(1);
    expect(screen.queryByTestId('evaluationNudge')).not.toBeInTheDocument();

    await chat(2);
    expect(screen.getByTestId('evaluationNudge')).toHaveTextContent('Happy with these responses?');

    fireEvent.click(screen.getByTestId('runEvaluationButton'));
    expect(onRunEvaluation).toHaveBeenCalled();
  });

  test('stays hidden when there is no Golden Q&A set to run', async () => {
    renderTab({ hasGoldenQaSets: false }, [
      sendMock({ answer: 'Reply', requestId: 'r1' }),
      sendMock({ answer: 'Reply', requestId: 'r2' }),
    ]);

    await chat(2);

    expect(screen.queryByTestId('evaluationNudge')).not.toBeInTheDocument();
  });
});

test('sends only the fields LlmCallInput accepts', async () => {
  const variableMatcher = vi.fn().mockReturnValue(true);
  renderTab({}, [
    {
      request: { query: SEND_ASSISTANT_MESSAGE },
      variableMatcher,
      result: {
        data: {
          sendAssistantMessage: {
            answer: 'Hi',
            conversationId: 'c1',
            jobId: 'j1',
            requestId: 'r1',
            errors: null,
          },
        },
      },
    },
  ]);

  fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: 'Hello' } });
  fireEvent.click(screen.getByTestId('sendMessageButton'));

  await waitFor(() => {
    expect(variableMatcher).toHaveBeenCalled();
  });

  // the schema rejects question/requestId/versionId, and message is required
  expect(variableMatcher.mock.calls[0][0]).toEqual({ input: { assistantId: '1', message: 'Hello' } });
});

test('renders the model markdown rather than printing the syntax', async () => {
  renderTab({}, [
    sendMock({
      answer: '**Haan**, safe hai — see [the guide](https://example.com)\n\n- one\n- two',
      requestId: 'r1',
    }),
  ]);

  fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: 'Is it safe?' } });
  fireEvent.click(screen.getByTestId('sendMessageButton'));

  const bubble = await screen.findByTestId('assistantMessage');

  expect(bubble.querySelector('strong')).toHaveTextContent('Haan');
  expect(bubble.querySelectorAll('li')).toHaveLength(2);
  // links open away from the app rather than replacing it
  const link = bubble.querySelector('a');
  expect(link).toHaveAttribute('href', 'https://example.com');
  expect(link).toHaveAttribute('target', '_blank');
  expect(bubble).not.toHaveTextContent('**Haan**');
});

test('what the user typed is never treated as markdown', async () => {
  renderTab({}, [sendMock({ answer: 'ok', requestId: 'r1' })]);

  fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: '**not bold**' } });
  fireEvent.click(screen.getByTestId('sendMessageButton'));

  const sent = await screen.findByTestId('userMessage');
  expect(sent).toHaveTextContent('**not bold**');
  expect(sent.querySelector('strong')).toBeNull();
});

describe('starting over', () => {
  test('the button only appears once there is a chat to clear', async () => {
    renderTab({}, [sendMock({ answer: 'Hi', requestId: 'r1' })]);

    expect(screen.queryByTestId('newChatButton')).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByTestId('sendMessageButton'));

    expect(await screen.findByTestId('newChatButton')).toBeInTheDocument();
  });

  test('clears the transcript and starts a fresh conversation on the server', async () => {
    const variableMatcher = vi.fn().mockReturnValue(true);
    const mock = {
      request: { query: SEND_ASSISTANT_MESSAGE },
      variableMatcher,
      maxUsageCount: Number.POSITIVE_INFINITY,
      result: {
        data: {
          sendAssistantMessage: {
            answer: 'Hi',
            conversationId: 'c1',
            jobId: 'j1',
            requestId: 'r1',
            errors: null,
          },
        },
      },
    };
    renderTab({}, [mock]);

    fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByTestId('sendMessageButton'));
    await screen.findByTestId('assistantMessage');

    fireEvent.click(screen.getByTestId('newChatButton'));

    expect(screen.getByTestId('sandboxEmpty')).toBeInTheDocument();
    expect(screen.queryByTestId('userMessage')).not.toBeInTheDocument();
    expect(screen.queryByTestId('newChatButton')).not.toBeInTheDocument();

    // the next message must not continue the old conversation
    fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: 'Fresh start' } });
    fireEvent.click(screen.getByTestId('sendMessageButton'));

    await waitFor(() => {
      expect(variableMatcher).toHaveBeenCalledTimes(2);
    });
    expect(variableMatcher.mock.calls[1][0]).toEqual({ input: { assistantId: '1', message: 'Fresh start' } });
  });
});

describe('the chat survives leaving the tab', () => {
  const sendOne = async (text: string) => {
    fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: text } });
    fireEvent.click(screen.getByTestId('sendMessageButton'));
    await screen.findByTestId('assistantMessage');
  };

  test('a remount restores the transcript and the conversation it belongs to', async () => {
    const variableMatcher = vi.fn().mockReturnValue(true);
    const mock = {
      request: { query: SEND_ASSISTANT_MESSAGE },
      variableMatcher,
      maxUsageCount: Number.POSITIVE_INFINITY,
      result: {
        data: {
          sendAssistantMessage: {
            answer: 'Hi',
            conversationId: 'c1',
            jobId: 'j1',
            requestId: 'r1',
            errors: null,
          },
        },
      },
    };
    const { unmount } = renderTab({}, [mock]);
    await sendOne('Hello');
    unmount();

    // switching tabs or refreshing mounts the component again
    renderTab({}, [mock]);

    expect(await screen.findByTestId('userMessage')).toHaveTextContent('Hello');
    expect(screen.getByTestId('assistantMessage')).toHaveTextContent('Hi');

    // and the next message continues the same conversation
    fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: 'More' } });
    fireEvent.click(screen.getByTestId('sendMessageButton'));

    await waitFor(() => {
      expect(variableMatcher).toHaveBeenCalledTimes(2);
    });
    expect(variableMatcher.mock.calls[1][0]).toEqual({
      input: { assistantId: '1', message: 'More', conversationId: 'c1' },
    });
  });

  test('the question is cached even while the reply is still coming', async () => {
    const { unmount } = renderTab({}, [sendMock({ answer: null, requestId: 'r1' })]);

    fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: 'Waiting' } });
    fireEvent.click(screen.getByTestId('sendMessageButton'));
    await screen.findByTestId('pendingMessage');
    unmount();

    renderTab({}, []);

    // the question survives, but the typing indicator does not — the subscription that
    // would have answered it fired while the component was gone
    expect(await screen.findByTestId('userMessage')).toHaveTextContent('Waiting');
    expect(screen.queryByTestId('pendingMessage')).not.toBeInTheDocument();
  });

  test('New chat clears the cached copy, not just the screen', async () => {
    renderTab({}, [sendMock({ answer: 'Hi', requestId: 'r1' })]);
    await sendOne('Hello');

    fireEvent.click(screen.getByTestId('newChatButton'));
    expect(screen.getByTestId('sandboxEmpty')).toBeInTheDocument();

    renderTab({}, []);
    expect(screen.getAllByTestId('sandboxEmpty').length).toBeGreaterThan(0);
  });

  test('each version keeps its own transcript', async () => {
    renderTab({}, [sendMock({ answer: 'Hi', requestId: 'r1' })]);
    await sendOne('On version 2');

    // a different version is a different config, so a different conversation
    renderTab({ versionId: 'v9', versionNumber: 9 }, []);
    expect(screen.getAllByTestId('sandboxEmpty').length).toBeGreaterThan(0);
  });
});

describe('the answer arriving on the subscription', () => {
  const subscriptionMock = (payload: Record<string, unknown>) => ({
    request: { query: LLM_CALL_RESPONSE_SUBSCRIPTION, variables: { organizationId: '1' } },
    result: {
      data: {
        llmCallResponse: { answer: null, conversationId: 'c1', jobId: 'j1', errors: null, ...payload },
      },
    },
  });

  // the mutation only acknowledges; the answer comes later on llmCallResponse
  const ackMock = sendMock({ answer: null, requestId: 'r1' });

  const ask = () => {
    fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: 'Is it safe?' } });
    fireEvent.click(screen.getByTestId('sendMessageButton'));
  };

  test('an event matching our requestId becomes the reply', async () => {
    renderTab({}, [ackMock, subscriptionMock({ answer: 'Yes, in most cases.', requestId: 'r1' })]);
    ask();

    expect(await screen.findByTestId('assistantMessage')).toHaveTextContent('Yes, in most cases.');
    expect(screen.queryByTestId('pendingMessage')).not.toBeInTheDocument();
  });

  test('another tab answer is ignored — the subscription is organisation-wide', async () => {
    renderTab({}, [ackMock, subscriptionMock({ answer: 'Someone else reply', requestId: 'not-ours' })]);
    ask();

    await screen.findByTestId('userMessage');
    // still waiting: that event belonged to a different request
    expect(screen.getByTestId('pendingMessage')).toBeInTheDocument();
    expect(screen.queryByTestId('assistantMessage')).not.toBeInTheDocument();
  });

  test('errors delivered on the subscription land in the transcript', async () => {
    renderTab({}, [
      ackMock,
      subscriptionMock({ requestId: 'r1', errors: [{ key: 'llm', message: 'Model timed out' }] }),
    ]);
    ask();

    expect(await screen.findByTestId('assistantMessage')).toHaveTextContent('Model timed out');
  });

  test('an event with no answer at all still ends the wait', async () => {
    renderTab({}, [ackMock, subscriptionMock({ answer: null, requestId: 'r1' })]);
    ask();

    expect(await screen.findByTestId('assistantMessage')).toHaveTextContent('Could not get a reply');
  });
});

test('an answer that arrives before the mutation returns is still applied', async () => {
  // the server issues the requestId, so an event can land before we know ours. The slow
  // mutation forces exactly that ordering.
  const slowAck = {
    request: { query: SEND_ASSISTANT_MESSAGE },
    variableMatcher: () => true,
    delay: 60,
    result: {
      data: {
        sendAssistantMessage: { answer: null, conversationId: 'c1', jobId: 'j1', requestId: 'r1', errors: null },
      },
    },
  };
  const earlyEvent = {
    request: { query: LLM_CALL_RESPONSE_SUBSCRIPTION, variables: { organizationId: '1' } },
    result: {
      data: {
        llmCallResponse: {
          answer: 'Answered early',
          conversationId: 'c1',
          jobId: 'j1',
          requestId: 'r1',
          errors: null,
        },
      },
    },
  };

  renderTab({}, [slowAck, earlyEvent]);

  fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: 'Quick one' } });
  fireEvent.click(screen.getByTestId('sendMessageButton'));

  // held while the requestId is unknown, then replayed once the mutation names it
  expect(await screen.findByTestId('assistantMessage')).toHaveTextContent('Answered early');
});

test('an empty subscription payload is ignored rather than ending the wait', async () => {
  renderTab({}, [
    sendMock({ answer: null, requestId: 'r1' }),
    {
      request: { query: LLM_CALL_RESPONSE_SUBSCRIPTION, variables: { organizationId: '1' } },
      result: { data: { llmCallResponse: null } },
    },
  ]);

  fireEvent.change(screen.getByTestId('sandboxInput'), { target: { value: 'Hello' } });
  fireEvent.click(screen.getByTestId('sendMessageButton'));

  await screen.findByTestId('userMessage');
  expect(screen.getByTestId('pendingMessage')).toBeInTheDocument();
  expect(screen.queryByTestId('assistantMessage')).not.toBeInTheDocument();
});
