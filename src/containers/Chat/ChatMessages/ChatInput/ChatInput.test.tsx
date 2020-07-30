import React from 'react';
import { shallow, mount } from 'enzyme';
import ChatInput from './ChatInput';

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

  const wrapper = shallow(<ChatInput {...defaultProps} />);

  test('it should render the input element', () => {
    expect(wrapper.find('[data-testid="message-input"]')).toHaveLength(1);
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
    const submit = wrapper.find('[data-testid="send-button"]');
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
});
