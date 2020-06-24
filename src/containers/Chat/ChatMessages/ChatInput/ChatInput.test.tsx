import React from 'react';

import { shallow, mount } from 'enzyme';
import ChatInput from './ChatInput';

describe('<ChatInput />', () => {
  let inputSubmitted = false;
  const onSendMessageHandler = () => {
    inputSubmitted = true;
  };

  beforeEach(() => {
    inputSubmitted = false;
  });

  const defaultProps = {
    onSendMessage: onSendMessageHandler,
  };

  const wrapper = shallow(<ChatInput {...defaultProps} />);

  test('it should render the input element', () => {
    expect(wrapper.find('[data-testid="message-input"]')).toHaveLength(1);
  });

  test('it should check if the send button is clicked', () => {
    const input = wrapper.find('[data-testid="message-input"]');
    input.simulate('change', { target: { value: 'Hello' } });

    expect(inputSubmitted).toBeFalsy();
    wrapper.find('[data-testid="send-button"]').simulate('click');
    expect(inputSubmitted).toBeTruthy();
  });

  test('it should check if the enter is hit by user', () => {
    const input = wrapper.find('[data-testid="message-input"]');
    input.simulate('change', { target: { value: 'Hello' } });
    input.simulate('keypress', { key: 'Enter' });

    // TODO: both change and keypress are triggered correctly so wondering if we need any assertion here
  });

  test('it should select and set emoji', () => {
    const input = wrapper.find('[data-testid="message-input"]');

    // open the emoji popup
    wrapper.find('[data-testid="emoji-picker"]').simulate('click');

    expect(wrapper.find('[data-testid="emoji-popup"]')).toHaveLength(1);

    // select an emoji
    //wrapper.find('[data-testid="emoji-popup"] button').simulate('click');

    // close the emoji popup
    input.simulate('click');
  });
});
