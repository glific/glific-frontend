import React from 'react';
import { shallow, mount } from 'enzyme';
import { MockedProvider } from '@apollo/client/testing';

import Chat from './Chat';
import { CONVERSATION_QUERY_MOCKS } from './Chat.test.helper';

const mocks = CONVERSATION_QUERY_MOCKS;

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
});
