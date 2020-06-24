import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import gqlClient from '../../../config/apolloclient';

import { mount } from 'enzyme';
import ChatConversations from './ChatConversations';
import { ApolloProvider } from '@apollo/client';

describe('<ChatConversations />', () => {
  let wrapper: any;

  beforeAll(() => {
    wrapper = mount(
      <ApolloProvider client={gqlClient}>
        <Router>
          <ChatConversations />
        </Router>
      </ApolloProvider>
    );
  });

  test('it should render <ChatConversations /> component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('it should wait for data to load', () => {
    expect(wrapper.text()).toEqual('Loading...');
  });

  // TODO: Need to implement comprehensive test cases for this component
});
