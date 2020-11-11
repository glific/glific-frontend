import React from 'react';
import ChatInput from './ChatInput';
import ChatTemplates from '../ChatTemplates/ChatTemplates';
import { MockedProvider } from '@apollo/client/testing';
import { render, wait, act, fireEvent } from '@testing-library/react';
import { TEMPLATE_MOCKS } from '../../../../mocks/Template';

const mocks = TEMPLATE_MOCKS;

describe('<ChatInput />', () => {
  let inputSubmitted = false;
  const onSendMessageHandler = (message: string) => {
    inputSubmitted = true;
  };
  const handleHeightChange = jest.fn();

  beforeEach(() => {
    inputSubmitted = false;
  });

  const defaultProps = {
    onSendMessage: onSendMessageHandler,
    handleHeightChange: handleHeightChange,
    contactStatus: 'VALID',
    contactBspStatus: 'SESSION_AND_HSM',
  };

  const chatInput = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <ChatInput {...defaultProps} />
    </MockedProvider>
  );

  test('it should render the input element', () => {
    const { getByTestId } = render(chatInput);
    expect(getByTestId('message-input-container')).toBeInTheDocument();
  });

  test('speed send and template buttons should exist', () => {
    const { getAllByTestId } = render(chatInput);
    expect(getAllByTestId('shortcutButton')).toHaveLength(2);
  });

  // check how to handle draft js

  // test('it should check if change handler is working as expected', () => {
  //   const input = wrapper.find('[data-testid="message-input"]');
  //   input.simulate('change', { target: { value: 'Hello' } });
  // });

  // test('it should check if the enter is hit by user', () => {
  //   const input = wrapper.find('[data-testid="message-input"]');
  //   input.simulate('change', { target: { value: 'Hello' } });
  //   input.simulate('keypress', { key: 'Enter' });

  //   // TODO: both change and keypress are triggered correctly so wondering if we need any assertion here
  // });

  test('it should not be able to submit without any message', () => {
    const { getByTestId } = render(chatInput);
    fireEvent.click(getByTestId('sendButton'));
    expect(inputSubmitted).toBeFalsy();
  });

  // test('submit message callback working properly', () => {
  //   const editor = wrapper.find('[data-testid="message-input"]');
  //   act(() => {
  //     editor.props().sendMessage('This is a test message.');
  //   });
  //   expect(inputSubmitted).toBeTruthy();
  // });

  // test('height change should get hit', () => {
  //   const editor = wrapper.find('[data-testid="message-input"]');
  //   editor.props().handleHeightChange(30);
  //   expect(handleHeightChange).toHaveBeenCalled();
  // });

  // test('chat templates should open when either speed send or templates button is clicked', () => {
  //   // Speed sends button
  //   const speedSends = wrapper.find('[data-testid="shortcutButton"]').first();
  //   speedSends.simulate('click');
  //   expect(speedSends.find(ChatTemplates)).toBeTruthy();
  //   speedSends.simulate('click');
  //   expect(speedSends.find(ChatTemplates).exists()).toBeFalsy();

  //   // Templates button
  //   const templates = wrapper.find('[data-testid="shortcutButton"]').last();
  //   templates.simulate('click');
  //   expect(templates.find(ChatTemplates)).toBeTruthy();
  //   templates.simulate('click');
  //   expect(templates.find(ChatTemplates).exists()).toBeFalsy();
  // });

  // test('check if reset button works', async () => {
  //   const speedSends = wrapper.find('[data-testid="shortcutButton"]').first();
  //   speedSends.simulate('click');
  //   await wait();
  //   const searchInput = wrapper.find('[data-testid="searchInput"] input');
  //   searchInput.simulate('change', { target: { value: 'hi' } });
  //   await wait();
  //   const resetButton = wrapper.find('button[data-testid="resetButton"]');
  //   resetButton.simulate('click');
  // });

  // test('clicking on a speed send from the list should store the value as input', async () => {
  //   const { getAllByTestId } = render(chatInput);
  //   const speedSends = getAllByTestId('shortcutButton')[0];
  //   fireEvent.click(speedSends);
  //   await wait();
  //   const listItem = getAllByTestId('templateItem')[0];
  //   fireEvent.click(listItem);
  // });
});
