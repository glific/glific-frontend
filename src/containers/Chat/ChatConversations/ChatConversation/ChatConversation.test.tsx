import React from 'react';

import { shallow } from 'enzyme';
import ChatConversation from './ChatConversation';
import moment from 'moment';

describe('<ChatConversation />', () => {
  const insertedAt = '2020-06-19T18:44:02Z';
  const defaultProps = {
    contactId: 1,
    contactName: 'Jane Doe',
    lastMessage: {
      body: 'Hello there!',
      insertedAt,
      tags: {
        id: 1,
        label: 'Unread',
      },
    },
  };
  const wrapper = shallow(<ChatConversation {...defaultProps} />);

  test('it should render the name correctly', () => {
    expect(wrapper.find('[data-testid="name"]').text()).toEqual('Jane Doe');
  });

  test('it should render the message content correctly', () => {
    expect(wrapper.find('[data-testid="content"]').text()).toEqual('Hello there!');
  });

  test('it should render the message date correctly', () => {
    expect(wrapper.find('[data-testid="date"]').text()).toEqual(moment(insertedAt).format('HH:mm'));
  });

  test('it should render the tags correctly', () => {
    //TODO: add the test once tag functionality is implemented
  });
});
