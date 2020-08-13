import React from 'react';
import { MessagesWithLinks } from './MessagesWithLinks';
import { shallow } from 'enzyme';

const messagesWithLinks = <MessagesWithLinks message={'hey There google.com'} />;

test('it renders correctly', () => {
  const wrapper = shallow(messagesWithLinks);
  expect(wrapper.exists()).toBe(true);
});
