import React from 'react';
import AddToMessageTemplate from './AddToMessageTemplate';
import { shallow, mount } from 'enzyme';

import { ApolloProvider } from '@apollo/client';

import gqlClient from '../../../../config/apolloclient';

describe('<AddToMessageTemplate />', () => {
  const defaultProps = {
    id: 1,
    message: 'Hello',
    changeDisplay: () => {},
  };

  const wrapper = mount(
    <ApolloProvider client={gqlClient}>
      <AddToMessageTemplate {...defaultProps} />
    </ApolloProvider>
  );

  it('it should render <AddToMessageTemplate /> component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should be able to get the same text that we select', () => {
    expect(wrapper.find('input').props().value).toBe('Hello');
  });
});
