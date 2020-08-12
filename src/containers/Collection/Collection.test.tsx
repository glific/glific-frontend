import React from 'react';
import { shallow } from 'enzyme';
import { Collection } from './Collection';
import { ApolloProvider } from '@apollo/client';
import gqlClient from '../../config/apolloclient';

const wrapper = shallow(
  <ApolloProvider client={gqlClient(null)}>
    <Collection />
  </ApolloProvider>
);

describe('<Collection />', () => {
  it('should render Collection', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
