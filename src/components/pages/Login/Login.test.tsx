import React from 'react';
import { shallow, mount } from 'enzyme';
import { Login } from './Login';
import { OutlinedInput } from '@material-ui/core';
import { Button } from '../../UI/Form/Button/Button';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

  it('send an axios post request properly', () => {
    jest.mock('axios');
    const wrapper = shallow(createLogin());
    const response = {
      data: { data: { renewal_token: 'RENEW_TOKEN', access_token: 'AUTH_TOKEN' } },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find(Button).simulate('click');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('shows password if button is clicked', () => {
    const wrapper = mount(createLogin());
    wrapper.find(IconButton).simulate('click');
    wrapper.find(Visibility);
  });

  it('preventDefault on onMouseDown for password visibility', () => {
    const wrapper = mount(createLogin());
    wrapper.find(IconButton).simulate('mouseDown', { preventDefault: () => true });
  });

  it('sets phone number error and password error as true if field is blank', () => {
    jest.mock('axios');
    const wrapper = shallow(createLogin());
    const response = {
      data: { data: { renewal_token: 'RENEW_TOKEN', access_token: 'AUTH_TOKEN' } },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find(Button).simulate('click');
    expect(wrapper.find(OutlinedInput).at(0).prop('error')).toBeTruthy;
    expect(wrapper.find(OutlinedInput).at(1).prop('error')).toBeTruthy;
  });

  it('sets phone number error as false if field is valid', () => {
    jest.mock('axios');
    const wrapper = shallow(createLogin());
    wrapper
      .find(OutlinedInput)
      .at(0)
      .simulate('change', { target: { value: '1231231234' } });
    wrapper
      .find(OutlinedInput)
      .at(1)
      .simulate('change', { target: { value: 'pass12345' } });
    const response = {
      data: { data: { renewal_token: 'RENEW_TOKEN', access_token: 'AUTH_TOKEN' } },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find(Button).simulate('click');
    expect(wrapper.find(OutlinedInput).at(0).prop('error')).toBeFalsy();
    expect(wrapper.find(OutlinedInput).at(1).prop('error')).toBeFalsy();
  });

  it('axios post request catchs error', () => {
    jest.mock('axios');
    const wrapper = shallow(createLogin());
    const response = {
      error: { message: 'Incorrect password or phone', status: 400 },
    };
    mockedAxios.post.mockRejectedValueOnce(response);
    wrapper.find(Button).simulate('click');
  });
});
