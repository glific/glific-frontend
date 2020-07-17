import React from 'react';
import { mount, shallow, render } from 'enzyme';
import ConversationList from './ConversationList';
import { MockedProvider } from '@apollo/client/testing';
import {
  GET_CONVERSATION_QUERY,
  FILTER_CONVERSATIONS_QUERY,
} from '../../../../graphql/queries/Chat';
import ChatConversation from '../ChatConversation/ChatConversation';
import { CONVERSATION_MOCKS } from '../../../../containers/Chat/Chat.test.helper';

const mocks = CONVERSATION_MOCKS;

describe('<ConversationList />', () => {
  const searchVal = '';
  const selectedContactId = 1;
  const mockSelectContactId = jest.fn();

  const wrapper = mount(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ConversationList
        searchVal={searchVal}
        selectedContactId={selectedContactId}
        setSelectedContactId={mockSelectContactId}
      />
    </MockedProvider>
  );

  console.log(wrapper);

  // test('it should render <ConversationList /> component correctly', () => {
  //   expect(wrapper.exists()).toBe(true);
  // });

  // test('it should check state to be correct', () => {
  //   let state = wrapper.props().children.props;
  //   expect(state.searchVal === '');
  //   expect(state.selectedContactId === 1);
  // });

  // test('it should have ChatConversation objects', () => {
  //   console.log(wrapper.debug());
  //   // console.log(wrapper.find(ChatConversation).length); //.toHaveLength(2);
  // });
});

// Test filter (with mock)
// const wrapper = shallow(
//   <MockedProvider mocks={mocks} addTypename={false}>
//     <ChatConversations />
//   </MockedProvider>
// );

// Test contactId and setting

// Check ChatConversation object(s) there and correct number
