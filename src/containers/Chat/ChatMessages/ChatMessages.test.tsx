import React from 'react';
import { mount } from 'enzyme';
import { ApolloProvider } from '@apollo/client';

import gqlClient from '../../../config/apolloclient';
import ChatMessages from './ChatMessages';

describe('<ChatMessages />', () => {
  const defaultProps = {
    contactId: '1',
  };

  const wrapper = mount(
    <ApolloProvider client={gqlClient}>
      <ChatMessages {...defaultProps} />
    </ApolloProvider>
  );

  test('it should render <ChatMessages /> component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
