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


window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('<ChatMessage />', () => {
  const insertedAt = '2020-06-19T18:44:02Z';
  const Props = (link: any) => {
    return {
      id: 1,
      body: '*Hello there!* visit google.com',
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
      type: link,
      media: { url: 'http://glific.com' },
    };
  };

  const chatMessage = (type: any) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <ChatMessage {...Props(type)} />
    </MockedProvider>
  );

  const chatMessageText = chatMessage('TEXT');
  let wrapper = mount(chatMessageText);

  test('it should render the message content correctly', () => {
    const { getByTestId } = render(chatMessageText);
    expect(getByTestId('content').textContent).toEqual('Hello there! visit google.com');
  });

  test('it should apply the correct styling', () => {
    const { getByTestId } = render(chatMessageText);
    expect(getByTestId('content').innerHTML.includes('<b>Hello there!</b>')).toBe(true);
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
    const { getByTestId } = render(chatMessageText);
    const tags = within(getByTestId('tags'));
    expect(tags.getByText('important')).toBeInTheDocument();
  });

  test('it should render the down arrow icon', () => {
    const { getAllByTestId } = render(chatMessageText);
    expect(getAllByTestId('messageOptions')[0]).toBeInTheDocument();
  });

  test('it should render popup', async () => {
    const { getAllByTestId } = render(chatMessageText);
    expect(getAllByTestId('popup')[0]).toBeInTheDocument();
  });

  test('click on delete icon should call the delete query', async () => {
    const { getAllByTestId } = render(chatMessageText);
    fireEvent.click(getAllByTestId('deleteIcon')[0]);
    await wait();

    expect(resultReturned).toBe(true);
  });

  test('it should detect a link in messsage', async () => {
    const { getByTestId } = render(chatMessageText);
    expect(getByTestId('messageLink').getAttribute('href')).toBe('http://google.com');
  });

  const chatMessageVideo = chatMessage('VIDEO');
  wrapper = mount(chatMessageVideo);
  test('it should show the download media option when clicked on down arrow and message type is video', async () => {
    const { getAllByTestId } = render(chatMessageVideo);
    fireEvent.click(getAllByTestId('popup')[0]);
    expect(getAllByTestId('downloadMedia')[0]).toBeVisible();
  });

  const chatMessageAudio = chatMessage('AUDIO');
  wrapper = mount(chatMessageAudio);
  test('it should show the download media option when clicked on down arrow and message type is audio', async () => {
    const { getAllByTestId } = render(chatMessageAudio);
    fireEvent.click(getAllByTestId('popup')[0]);
    expect(getAllByTestId('downloadMedia')[0]).toBeVisible();
  });

  const chatMessageImage = chatMessage('IMAGE');
  wrapper = mount(chatMessageImage);
  test('it should show the download media option when clicked on down arrow and message type is image', async () => {
    const { getAllByTestId } = render(chatMessageImage);
    fireEvent.click(getAllByTestId('popup')[0]);
    expect(getAllByTestId('downloadMedia')[0]).toBeVisible();
  });

  const chatMessageDoc = chatMessage('DOCUMENT');
  wrapper = mount(chatMessageDoc);
  test('it should show the download media option when clicked on down arrow and message type is document', async () => {
    const { getAllByTestId } = render(chatMessageDoc);
    fireEvent.click(getAllByTestId('popup')[0]);
    expect(getAllByTestId('downloadMedia')[0]).toBeVisible();
  });
});
