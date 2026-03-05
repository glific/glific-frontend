import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render } from '@testing-library/react';
import dayjs from 'dayjs';
import { MemoryRouter } from 'react-router';

import { SHORT_DATE_FORMAT } from 'common/constants';
import { MARK_AS_READ } from 'graphql/mutations/Chat';
import ChatConversation from './ChatConversation';

const mockCallback = vi.fn();

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
  entityId: 1,
  contactName: 'Jane Doe',
  contactIsOrgRead: true,
  selected: true,
  index: 0,
  onClick: mockCallback,
  senderLastMessage: {
    body: 'Hey!',
    insertedAt,
  },
  lastMessage: {
    body: 'Hello there!',
    insertedAt,
    type: 'TEXT',
  },
};

const wrapperContainer = (props: any) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <ChatConversation {...props} />
    </MemoryRouter>
  </MockedProvider>
);

test('it should render the name correctly', () => {
  const { getByTestId } = render(wrapperContainer(defaultProps));
  expect(getByTestId('name')).toHaveTextContent('Jane Doe');
});

test('it should render the message content correctly', () => {
  const { getByTestId } = render(wrapperContainer(defaultProps));
  expect(getByTestId('content')).toHaveTextContent('Hello there!');
});

test('it should render the message content correctly on search', () => {
  const props: any = { ...defaultProps, highlightSearch: 'Hello' };

  const { getByTestId } = render(wrapperContainer(props));
  expect(getByTestId('highlightText')).toHaveTextContent('Hello');
});

test('it should render the message date correctly', () => {
  const { getByTestId } = render(wrapperContainer(defaultProps));
  expect(getByTestId('date')).toHaveTextContent(dayjs(insertedAt).format(SHORT_DATE_FORMAT));
});

test('it should call the callback function on click action', () => {
  const { getAllByTestId } = render(wrapperContainer(defaultProps));
  fireEvent.click(getAllByTestId('list')[0]);
  expect(mockCallback).toHaveBeenCalled();
});

test('it should not throw when lastMessage body is null', () => {
  const props = {
    ...defaultProps,
    highlightSearch: 'test',
    lastMessage: { body: null, insertedAt, type: 'TEXT' },
  };
  expect(() => render(wrapperContainer(props))).not.toThrow();
});

test('it should not throw when lastMessage body is undefined', () => {
  const props = {
    ...defaultProps,
    highlightSearch: 'test',
    lastMessage: { body: undefined, insertedAt, type: 'TEXT' },
  };
  expect(() => render(wrapperContainer(props))).not.toThrow();
});

test('it should truncate message body longer than 35 characters', () => {
  const longBody = 'This is a very long message that exceeds the limit';
  const props = {
    ...defaultProps,
    lastMessage: { body: longBody, insertedAt, type: 'TEXT' },
  };
  const { getByTestId } = render(wrapperContainer(props));
  expect(getByTestId('content').textContent).toContain('...');
});

test('it should not truncate message body within 35 characters', () => {
  const shortBody = 'Short message';
  const props = {
    ...defaultProps,
    lastMessage: { body: shortBody, insertedAt, type: 'TEXT' },
  };
  const { getByTestId } = render(wrapperContainer(props));
  expect(getByTestId('content').textContent).not.toContain('...');
});

test('it should replace newlines with spaces in TEXT messages', () => {
  const props = {
    ...defaultProps,
    lastMessage: { body: 'Hello\nWorld', insertedAt, type: 'TEXT' },
  };
  const { getByTestId } = render(wrapperContainer(props));
  expect(getByTestId('content').textContent).not.toContain('\n');
});
