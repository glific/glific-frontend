import { MockedProvider } from '@apollo/client/testing';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? key.replace(/\{\{(\w+)\}\}/g, (_match, name) => String(options[name] ?? '')) : key,
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
}));
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as Notification from 'common/notification';
import { IMPROVE_EVALUATION_PROMPT } from 'graphql/mutations/AIEvaluations';
import { SuggestedPrompt } from './SuggestedPrompt';

const metrics = { groundTruth: 4.7, knowledgeBase: 1.47, prompt: 5 };

const improveMock = (result: any) => ({
  request: { query: IMPROVE_EVALUATION_PROMPT, variables: { evaluationId: 'r1' } },
  result,
});

const renderChange = (props: Partial<Parameters<typeof SuggestedPrompt>[0]> = {}, mocks: any[] = []) =>
  render(
    <MockedProvider mocks={mocks}>
      <SuggestedPrompt runId="r1" overall={2.9} metrics={metrics} {...props} />
    </MockedProvider>
  );

test('a run that scored well has nothing to act on', () => {
  renderChange({ overall: 4.4 });

  expect(screen.getByTestId('suggestedPromptNone')).toHaveTextContent(
    "Nothing to change — this run scores well. Publish it when you're ready."
  );
  expect(screen.queryByTestId('applySuggestionButton')).not.toBeInTheDocument();
});

test('anything less is pinned to the weakest check', () => {
  renderChange();

  const panel = screen.getByTestId('suggestedPrompt');
  // knowledge base is the lowest of the three, so that is what the suggestion is about
  expect(panel).toHaveTextContent('Some replies invent detail not in your documents.');
  expect(screen.queryByTestId('whyThisChange')).not.toBeInTheDocument();
});

test('the reason behind it names the check and its score', () => {
  renderChange();

  fireEvent.click(screen.getByTestId('whyThisChangeButton'));

  expect(screen.getByTestId('whyThisChange')).toHaveTextContent(
    'Targets your weakest check — adherence to knowledge base at 1.47/5'
  );
});

test('applying it asks the server to rewrite the prompt for this run', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification').mockImplementation(() => {});
  renderChange({}, [
    improveMock({ data: { improveEvaluationPrompt: { errors: null, improvePrompt: { status: 'pending' } } } }),
  ]);

  fireEvent.click(screen.getByTestId('applySuggestionButton'));

  await waitFor(() => expect(notificationSpy).toHaveBeenCalledWith(expect.stringContaining('Prompt improvement')));
  notificationSpy.mockRestore();
});

test('a refusal from the server is reported and the suggestion stays', async () => {
  const errorSpy = vi.spyOn(Notification, 'setErrorMessage').mockImplementation(() => {});
  renderChange({}, [
    improveMock({
      data: { improveEvaluationPrompt: { errors: [{ message: 'not allowed' }], improvePrompt: null } },
    }),
  ]);

  fireEvent.click(screen.getByTestId('applySuggestionButton'));

  await waitFor(() => expect(errorSpy).toHaveBeenCalled());
  expect(screen.getByTestId('suggestedPrompt')).toBeInTheDocument();
  errorSpy.mockRestore();
});

test('dismissing it leaves a way back', () => {
  renderChange();

  fireEvent.click(screen.getByTestId('dismissSuggestionButton'));
  expect(screen.getByTestId('suggestedPromptDismissed')).toHaveTextContent('Suggestion dismissed');

  fireEvent.click(screen.getByTestId('restoreSuggestionButton'));
  expect(screen.getByTestId('suggestedPrompt')).toBeInTheDocument();
});

test('a poor run with no check scored is not told it scored well', () => {
  renderChange({ overall: 1.2, metrics: { groundTruth: null, knowledgeBase: null, prompt: null } });

  const panel = screen.getByTestId('suggestedPromptUnscored');
  expect(panel).toHaveTextContent('None of the checks reported a score');
  expect(panel).not.toHaveTextContent('this run scores well');
  expect(screen.queryByTestId('suggestedPromptNone')).not.toBeInTheDocument();
  expect(screen.queryByTestId('applySuggestionButton')).not.toBeInTheDocument();
});

test('a good run with no check scored still reads as settled', () => {
  renderChange({ overall: 4.4, metrics: { groundTruth: null, knowledgeBase: null, prompt: null } });

  expect(screen.getByTestId('suggestedPromptNone')).toHaveTextContent('this run scores well');
});
