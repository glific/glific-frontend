import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { MARK_AS_READ } from '../../../../graphql/mutations/Chat';
import ChatConversation from './ChatConversation';
import { DATE_FORMAT } from '../../../../common/constants';

const mockCallback = jest.fn();

const mocks = [
  {
    request: {
      query: MARK_AS_READ,
      variables: {
        contactId: '1',
      },
    },
    result: {
      data: {
        markContactMessagesAsRead: ['2'],
      },
    },
  },
];

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

const wrapper = mount(
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <ChatConversation {...defaultProps} />
    </MemoryRouter>
  </MockedProvider>
);

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
  wrapper.find('[data-testid="list"]').at(0).simulate('click');
  expect(mockCallback).toHaveBeenCalled();
});

test('check the condition with empty tags', () => {
  const propswithEmptyTags = { ...defaultProps };
  propswithEmptyTags.lastMessage.tags = [];
  const chatWrapper = mount(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <ChatConversation {...propswithEmptyTags} />
      </MemoryRouter>
    </MockedProvider>
  );
  expect(chatWrapper.find('.ChatInfoRead')).toHaveLength(1);
});

test('check the condition with tag unread', () => {
  const propsWithTagUnread = defaultProps;
  propsWithTagUnread.lastMessage.tags = [{ id: 2, label: 'Unread' }];
  const chatWrapper = mount(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <ChatConversation {...propsWithTagUnread} />
      </MemoryRouter>
    </MockedProvider>
  );

  expect(chatWrapper.find('.ChatInfoUnread')).toHaveLength(1);
});
