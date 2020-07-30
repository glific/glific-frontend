import React from 'react';
import { shallow, mount } from 'enzyme';
import ChatInput from './ChatInput';
import ChatTemplates from '../ChatTemplates/ChatTemplates';
import { MockedProvider } from '@apollo/client/testing';
import { render, wait, fireEvent } from '@testing-library/react';
import { TEMPLATE_MOCKS } from '../../../Template/SpeedSend/SpeedSendList/SpeedSendList.test.helper';

const mocks = TEMPLATE_MOCKS;

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

  test('it should select and set emoji', () => {
    const shallowWrapper = shallow(<ChatInput {...defaultProps} />);
    const input = shallowWrapper.find('[data-testid="message-input"]');

    // open the emoji popup
    shallowWrapper.find('[data-testid="emoji-picker"]').simulate('click');

    expect(shallowWrapper.find('[data-testid="emoji-popup"]')).toHaveLength(1);

    // TODO: select an emoji
    //wrapper.find('[data-testid="emoji-popup"] button').simulate('click');

    // close the emoji popup
    input.simulate('click');
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
