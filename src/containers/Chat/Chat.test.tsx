import React from 'react';
import { mount } from 'enzyme';
import { MockedProvider } from '@apollo/client/testing';

import Chat from './Chat';
import { CONVERSATION_MOCKS } from './Chat.test.helper';

const mocks = CONVERSATION_MOCKS;

describe('<Chat />', () => {
  const defaultProps = {
    contactId: 2,
  };

  const wrapper = mount(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Chat {...defaultProps} />
    </MockedProvider>
  );

  test('it should render <Chat /> component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should display loading component', () => {
    expect(wrapper.find('[data-testid="loader"]')).toHaveLength(1);
  });

  test('it should render <ChatMessages /> component correctly', () => {
    expect(wrapper.find('.ChatMessages')).toHaveLength(1);
  });
});
