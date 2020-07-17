import React from 'react';
import { shallow, mount } from 'enzyme';
import ChatConversations from './ChatConversations';
import { SearchBar } from '../../../components/UI/SearchBar/SearchBar';
import ConversationList from './ConversationList/ConversationList';

describe('<ChatConversations />', () => {
  const wrapper = shallow(<ChatConversations contactId={0} />);

  test('it should render <ChatConversations /> component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('it should render a SearchBar component properly', () => {
    expect(wrapper.find(SearchBar)).toBeTruthy();
  });

  test('it should render a list component for conversations', () => {
    expect(wrapper.find(ConversationList)).toBeTruthy();
  });
});
