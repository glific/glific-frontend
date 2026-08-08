import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen } from '@testing-library/react';

import * as Notification from 'common/notification';
import * as RichEditor from 'common/RichEditor';
import { LexicalWrapper } from 'common/LexicalWrapper';

import {
  aiAssistCustomSuccessMocks,
  aiAssistErrorMocks,
  aiAssistPollFailedMocks,
  aiAssistProfessionalSuccessMocks,
  aiAssistUtilitySuccessMocks,
  customPromptText,
  rephrasedText,
  sampleBody,
} from 'mocks/TemplateRephrase';

import { AIAssist } from './AIAssist';

const errorMessageSpy = vi.spyOn(Notification, 'setErrorMessage');
const setDefaultValueSpy = vi.spyOn(RichEditor, 'setDefaultValue');

const POLL_INTERVAL = 2000;

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

const renderAIAssist = (mocks: any = [], body: string = sampleBody, disabled?: boolean) =>
  render(
    <MockedProvider mocks={mocks}>
      <LexicalWrapper>
        <AIAssist body={body} disabled={disabled} />
      </LexicalWrapper>
    </MockedProvider>
  );

test('the trigger button is disabled when the body is blank', () => {
  renderAIAssist([], '');
  expect(screen.getByTestId('ai-assist-button')).toBeDisabled();
});

test('the trigger button is disabled when the disabled prop is set', () => {
  renderAIAssist([], sampleBody, true);
  expect(screen.getByTestId('ai-assist-button')).toBeDisabled();
});

test('dropdown opens and shows all 3 options', () => {
  renderAIAssist();

  fireEvent.click(screen.getByTestId('ai-assist-button'));

  expect(screen.getByTestId('ai-assist-professional')).toBeInTheDocument();
  expect(screen.getByTestId('ai-assist-utility')).toBeInTheDocument();
  expect(screen.getByTestId('ai-assist-custom')).toBeInTheDocument();
  expect(screen.getByText('Make it sound professional')).toBeInTheDocument();
  expect(screen.getByText('Make it utility')).toBeInTheDocument();
  expect(screen.getByText('Custom prompt')).toBeInTheDocument();
});

test('clicking "professional" fires the mutation with the PROFESSIONAL action and updates the editor on ready', async () => {
  renderAIAssist(aiAssistProfessionalSuccessMocks);

  fireEvent.click(screen.getByTestId('ai-assist-button'));
  fireEvent.click(screen.getByTestId('ai-assist-professional'));

  expect(screen.getByTestId('ai-assist-button')).toBeDisabled();

  await advanceGeneration();

  expect(setDefaultValueSpy).toHaveBeenCalledWith(expect.anything(), rephrasedText);
  expect(errorMessageSpy).not.toHaveBeenCalled();
  expect(screen.getByTestId('ai-assist-button')).not.toBeDisabled();
});

test('clicking "utility" fires the mutation with the UTILITY action and no customPrompt', async () => {
  renderAIAssist(aiAssistUtilitySuccessMocks);

  fireEvent.click(screen.getByTestId('ai-assist-button'));
  fireEvent.click(screen.getByTestId('ai-assist-utility'));

  await advanceGeneration();

  expect(setDefaultValueSpy).toHaveBeenCalledWith(expect.anything(), rephrasedText);
  expect(errorMessageSpy).not.toHaveBeenCalled();
});

test('clicking "Custom prompt" opens a popover with a disabled submit until text is entered', () => {
  renderAIAssist();

  fireEvent.click(screen.getByTestId('ai-assist-button'));
  fireEvent.click(screen.getByTestId('ai-assist-custom'));

  const input = screen.getByTestId('ai-assist-custom-prompt-input').querySelector('textarea, input');
  expect(input).toBeInTheDocument();
  expect(screen.getByTestId('ai-assist-custom-prompt-submit')).toBeDisabled();

  fireEvent.change(input as Element, { target: { value: '   ' } });
  expect(screen.getByTestId('ai-assist-custom-prompt-submit')).toBeDisabled();
});

test('submitting a custom prompt fires the mutation with action CUSTOM and the typed text', async () => {
  renderAIAssist(aiAssistCustomSuccessMocks);

  fireEvent.click(screen.getByTestId('ai-assist-button'));
  fireEvent.click(screen.getByTestId('ai-assist-custom'));

  const input = screen.getByTestId('ai-assist-custom-prompt-input').querySelector('textarea, input') as Element;
  fireEvent.change(input, { target: { value: customPromptText } });

  expect(screen.getByTestId('ai-assist-custom-prompt-submit')).not.toBeDisabled();
  fireEvent.click(screen.getByTestId('ai-assist-custom-prompt-submit'));

  await advanceGeneration();

  expect(setDefaultValueSpy).toHaveBeenCalledWith(expect.anything(), rephrasedText);
  expect(errorMessageSpy).not.toHaveBeenCalled();
});

test('shows an error and re-enables the trigger when the network request fails', async () => {
  renderAIAssist(aiAssistErrorMocks);

  fireEvent.click(screen.getByTestId('ai-assist-button'));
  fireEvent.click(screen.getByTestId('ai-assist-professional'));

  await advanceGeneration();

  expect(errorMessageSpy).toHaveBeenCalled();
  expect(setDefaultValueSpy).not.toHaveBeenCalled();
  expect(screen.getByTestId('ai-assist-button')).not.toBeDisabled();
});

test('shows an error when polling resolves to a failed status', async () => {
  renderAIAssist(aiAssistPollFailedMocks);

  fireEvent.click(screen.getByTestId('ai-assist-button'));
  fireEvent.click(screen.getByTestId('ai-assist-professional'));

  await advanceGeneration();

  expect(errorMessageSpy).toHaveBeenCalled();
  expect(setDefaultValueSpy).not.toHaveBeenCalled();
  expect(screen.getByTestId('ai-assist-button')).not.toBeDisabled();
});
