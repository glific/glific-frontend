import React from 'react';
import { render, wait, within, fireEvent } from '@testing-library/react';
import moment from 'moment';
import { shallow, mount } from 'enzyme';

import ChatMessage from './ChatMessage';
import { TIME_FORMAT } from '../../../../common/constants';
import { MockedProvider } from '@apollo/client/testing';
import { UPDATE_MESSAGE_TAGS } from '../../../../graphql/mutations/Chat';

let resultReturned = false;

const mocks = [
  {
    request: {
      query: UPDATE_MESSAGE_TAGS,
      variables: {
        input: {
          messageId: 1,
          addTagIds: [],
          deleteTagIds: ['1'],
        },
      },
    },
    result() {
      resultReturned = true;
      return {
        data: {
          messageTags: [],
        },
      };
    },
  },
];

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('<ChatMessage />', () => {
  const insertedAt = '2020-06-19T18:44:02Z';
  const defaultProps = {
    id: 1,
    body: 'Hello there!',
    contactId: 2,
    receiver: {
      id: 1,
    },
    sender: {
      id: 2,
    },
    showMessage: true,
    popup: 1,
    open: true,
    insertedAt,
    tags: [
      {
        id: 1,
        label: 'important',
      },
    ],
  };

  const chatMessage = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <ChatMessage {...defaultProps} />
    </MockedProvider>
  );

  const wrapper = mount(chatMessage);

  test('it should render the message content correctly', () => {
    expect(wrapper.find('[data-testid="content"]').text()).toEqual('Hello there!');
  });

  test('it should render the message date  correctly', () => {
    expect(wrapper.find('[data-testid="date"]').text()).toEqual(
      moment(insertedAt).format(TIME_FORMAT)
    );
  });

  test('it should render "Other" class for the content', () => {
    expect(wrapper.find('.Other')).toHaveLength(1);
  });

  test('it should render the tags correctly', () => {
    const { getByTestId } = render(chatMessage);
    const tags = within(getByTestId('tags'));
    expect(tags.getByText('important')).toBeInTheDocument();
  });

  test('it should render the down arrow icon', () => {
    const { getAllByTestId } = render(chatMessage);
    expect(getAllByTestId('messageOptions')[0]).toBeInTheDocument();
  });

  test('it should render popup', async () => {
    const { getAllByTestId } = render(chatMessage);
    expect(getAllByTestId('popup')[0]).toBeInTheDocument();
  });

  test('click on delete icon should call the delete query', async () => {
    const { getAllByTestId } = render(chatMessage);
    fireEvent.click(getAllByTestId('deleteIcon')[0]);
    await wait();

    expect(resultReturned).toBe(true);
  });
});
