import React from 'react';
import { mount } from 'enzyme';
import ChatInput from './ChatInput';
import ChatTemplates from '../ChatTemplates/ChatTemplates';
import { MockedProvider } from '@apollo/client/testing';
import { render, wait, fireEvent } from '@testing-library/react';
import { TEMPLATE_MOCKS } from '../ChatTemplates/ChatTemplates.test.helper';

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
  };

  const chatInput = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <ChatInput {...defaultProps} />
    </MockedProvider>
  );
  const wrapper = mount(chatInput);

  test('it should render the input element', () => {
    expect(wrapper.find('[data-testid="message-input"]')).toHaveLength(1);
  });

  test('speed send and template buttons should exist', () => {
    expect(wrapper.find('[data-testid="shortcut-button"]')).toHaveLength(2);
  });

  test('it should check if change handler is working as expected', () => {
    const input = wrapper.find('[data-testid="message-input"]');
    input.simulate('change', { target: { value: 'Hello' } });
  });

  test('it should check if the enter is hit by user', () => {
    const input = wrapper.find('[data-testid="message-input"]');
    input.simulate('change', { target: { value: 'Hello' } });
    input.simulate('keypress', { key: 'Enter' });

    // TODO: both change and keypress are triggered correctly so wondering if we need any assertion here
  });

  test('it should not be able to submit without any message', () => {
    const submit = wrapper.find('button[data-testid="send-button"]');
    expect(submit.prop('disabled')).toBeTruthy();
    submit.simulate('click');
    expect(inputSubmitted).toBeFalsy();
  });

  test('submit message callback working properly', () => {
    const submit = wrapper.find('[data-testid="message-input"]');
    submit.props().sendMessage('This is a test message.');
    expect(inputSubmitted).toBeTruthy();
  });

  test('height change should get hit', () => {
    const editor = wrapper.find('[data-testid="message-input"]');
    editor.props().handleHeightChange(30);
    expect(handleHeightChange).toHaveBeenCalled();
  });

  test('chat templates should open when either speed send or templates button is clicked', () => {
    // Speed sends button
    const speedSends = wrapper.find('[data-testid="shortcut-button"]').first();
    speedSends.simulate('click');
    expect(speedSends.find(ChatTemplates)).toBeTruthy();
    speedSends.simulate('click');
    expect(speedSends.find(ChatTemplates).exists()).toBeFalsy();

    // Templates button
    const templates = wrapper.find('[data-testid="shortcut-button"]').last();
    templates.simulate('click');
    expect(templates.find(ChatTemplates)).toBeTruthy();
    templates.simulate('click');
    expect(templates.find(ChatTemplates).exists()).toBeFalsy();
  });

  test('check if reset button works', () => {
    const speedSends = wrapper.find('[data-testid="shortcut-button"]').first();
    speedSends.simulate('click');

    const searchInput = wrapper.find('[data-testid="searchInput"] input');
    searchInput.simulate('change', { target: { value: 'hi' } });

    const resetButton = wrapper.find('button[data-testid="resetButton"]');
    resetButton.simulate('click');
  });

  test('clicking on a speed send from the list should store the value as input', async () => {
    const { getAllByTestId } = render(chatInput);
    const speedSends = getAllByTestId('shortcut-button')[0];
    fireEvent.click(speedSends);
    await wait();
    const listItem = getAllByTestId('list-item')[0];
    fireEvent.click(listItem);
  });
});
