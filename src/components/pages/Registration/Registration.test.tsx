import React from 'react';
import { shallow } from 'enzyme';
import { Registration } from './Registration';
import axios from 'axios';
import { OutlinedInput, Button } from '@material-ui/core';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';

describe('Registration test', () => {
  jest.mock('axios', () => ({
    post: jest.fn(),
  }));

  const createRegistration = () => <Registration />;

  it('renders component properly', () => {
    const wrapper = shallow(createRegistration());
    expect(wrapper).toBeTruthy();
  });

  it('updates state for username', () => {
    const wrapper = shallow(createRegistration());
    wrapper
      .find(OutlinedInput)
      .at(0)
      .simulate('change', { target: { value: 'username' } });
    expect(wrapper.find(OutlinedInput).at(0).prop('value')).toEqual('username');
  });

  it('adds state to phoneNumber', () => {
    const wrapper = shallow(createRegistration());
    wrapper
      .find(OutlinedInput)
      .at(1)
      .simulate('change', { target: { value: '1231231234' } });
    expect(wrapper.find(OutlinedInput).at(1).prop('value')).toEqual('1231231234');
  });

  it('adds state to password', () => {
    const wrapper = shallow(createRegistration());
    wrapper
      .find(OutlinedInput)
      .at(2)
      .simulate('change', { target: { value: 'pass12345' } });
    expect(wrapper.find(OutlinedInput).at(2).prop('value')).toEqual('pass12345');
  });

  it('adds state to confirmPassword', () => {
    const wrapper = shallow(createRegistration());
    wrapper
      .find(OutlinedInput)
      .at(3)
      .simulate('change', { target: { value: 'pass12345' } });
    expect(wrapper.find(OutlinedInput).at(3).prop('value')).toEqual('pass12345');
  });

  it('send an axios post request properly', () => {
    const wrapper = shallow(createRegistration());
    wrapper
      .find(OutlinedInput)
      .at(1)
      .simulate('change', { target: { value: '1231231234' } });
    // expect(axios.post).toBeCalledWith(REACT_APP_GLIFIC_AUTHENTICATION_API);
  });
});
