import React from 'react';
import { shallow } from 'enzyme';
import { Login } from './Login';
import { OutlinedInput, Button } from '@material-ui/core';

describe('Login test', () => {
  const createLogin = () => <Login />;

  it('renders component properly', () => {
    const wrapper = shallow(createLogin());
    expect(wrapper).toBeTruthy();
  });

  it('updates state for phone number', () => {
    const wrapper = shallow(createLogin());
    wrapper
      .find(OutlinedInput)
      .at(0)
      .simulate('change', { target: { value: '1231231234' } });
    expect(wrapper.find(OutlinedInput).at(0).prop('value')).toEqual('1231231234');
  });

  it('updates state for password', () => {
    const wrapper = shallow(createLogin());
    wrapper
      .find(OutlinedInput)
      .at(1)
      .simulate('change', { target: { value: 'pass12345' } });
    expect(wrapper.find(OutlinedInput).at(1).prop('value')).toEqual('pass12345');
  });
});
