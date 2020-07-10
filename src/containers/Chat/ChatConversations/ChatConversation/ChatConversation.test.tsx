import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';

import ChatConversation from './ChatConversation';
import { DATE_FORMAT } from '../../../../common/constants';

const mockCallback = jest.fn();

describe('<ChatConversation />', () => {
  const insertedAt = '2020-06-19T18:44:02Z';
  const defaultProps = {
    contactId: 1,
    contactName: 'Jane Doe',
    selected: true,
    index: 0,
    onClick: mockCallback,
    lastMessage: {
      body: 'Hello there!',
      insertedAt,
      tags: [
        {
          id: 1,
          label: 'Unread',
        },
      ],
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
    expect(wrapper.find('[data-testid="date"]').text()).toEqual(
      moment(insertedAt).format(DATE_FORMAT)
    );
  });

  test('it should call the callback function on click action', () => {
    wrapper.find('[data-testid="list"]').simulate('click');
    expect(mockCallback).toHaveBeenCalled();
  });

  test('check the condition with empty tags', () => {
    const newProps = { ...defaultProps };
    newProps.lastMessage.tags = [];
    const chatWrapper = shallow(<ChatConversation {...newProps} />);
    console.log(chatWrapper);
    expect(chatWrapper.find('.ChatInfoRead')).toHaveLength(1);
  });
});
