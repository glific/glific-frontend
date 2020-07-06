import React from 'react';
import { shallow } from 'enzyme';
import { Loading } from './Loading';

describe('Loading test', () => {
  const createLoading = () => <Loading />;

  it('renders component properly', () => {
    const wrapper = shallow(createLoading());
    expect(wrapper).toBeTruthy();
  });
});
