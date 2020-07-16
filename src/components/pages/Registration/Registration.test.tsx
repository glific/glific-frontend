import React from 'react';
import { shallow, mount } from 'enzyme';
import { Registration } from './Registration';
import axios from 'axios';
import Visibility from '@material-ui/icons/Visibility';
import { MockedProvider } from '@apollo/client/testing';
import { OutlinedInput, Button, IconButton } from '@material-ui/core';
import { REACT_APP_GLIFIC_AUTHENTICATION_API } from '../../../common/constants';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Registration test', () => {
  const createShallowRegistration = () => <Registration />;
  const createRegistration = () => (
    <Router>
      <Registration />
    </Router>
  );

  it('renders component properly', () => {
    const wrapper = shallow(createShallowRegistration());
    expect(wrapper).toBeTruthy();
  });

  it('updates state for username', () => {
    const wrapper = shallow(createShallowRegistration());
    wrapper
      .find(OutlinedInput)
      .at(0)
      .simulate('change', { target: { value: 'username' } });
    expect(wrapper.find(OutlinedInput).at(0).prop('value')).toEqual('username');
  });

  it('adds state to phoneNumber', () => {
    const wrapper = shallow(createShallowRegistration());
    wrapper
      .find(OutlinedInput)
      .at(1)
      .simulate('change', { target: { value: '1231231234' } });
    expect(wrapper.find(OutlinedInput).at(1).prop('value')).toEqual('1231231234');
  });

  it('adds state to password', () => {
    const wrapper = shallow(createShallowRegistration());
    wrapper
      .find(OutlinedInput)
      .at(2)
      .simulate('change', { target: { value: 'pass12345' } });
    expect(wrapper.find(OutlinedInput).at(2).prop('value')).toEqual('pass12345');
  });

  it('adds state to confirmPassword', () => {
    const wrapper = shallow(createShallowRegistration());
    wrapper
      .find(OutlinedInput)
      .at(3)
      .simulate('change', { target: { value: 'pass12345' } });
    expect(wrapper.find(OutlinedInput).at(3).prop('value')).toEqual('pass12345');
  });

  it('send an axios post request properly', () => {
    jest.mock('axios');
    const wrapper = shallow(createShallowRegistration());
    wrapper
      .find(OutlinedInput)
      .at(1)
      .simulate('change', { target: { value: '1231231234' } });
    const response = {
      data: { phone: '1231231234', message: 'OTP #{otp} sent successfully to #{phone}' },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find(Button).simulate('click');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('axios post request catchs error', () => {
    jest.mock('axios');
    const wrapper = shallow(createShallowRegistration());
    const response = {
      error: { message: 'Phone number not found', status: 400 },
    };
    mockedAxios.post.mockRejectedValueOnce(response);
    wrapper.find(Button).simulate('click');
  });

  it('sets confirmPasswordError to be true if passwords dont match', () => {
    const wrapper = shallow(createShallowRegistration());
    wrapper
      .find(OutlinedInput)
      .at(2)
      .simulate('change', { target: { value: 'pass12345' } });
    wrapper
      .find(OutlinedInput)
      .at(3)
      .simulate('change', { target: { value: 'pass12346' } });
    const response = {
      data: { phone: '1231231234', message: 'OTP #{otp} sent successfully to #{phone}' },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find(Button).simulate('click');
    expect(wrapper.find(OutlinedInput).at(3).prop('error')).toBeTruthy();
  });

  it('sets userNameError to be true if field is blank', () => {
    const wrapper = shallow(createShallowRegistration());
    const response = {
      data: { phone: '1231231234', message: 'OTP #{otp} sent successfully to #{phone}' },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find(Button).simulate('click');
    expect(wrapper.find(OutlinedInput).at(0).prop('error')).toBeTruthy();
  });

  it('sets userNameError to be false if there is a valid value', () => {
    const wrapper = shallow(createShallowRegistration());
    wrapper
      .find(OutlinedInput)
      .at(0)
      .simulate('change', { target: { value: 'username' } });
    const response = {
      data: { phone: '1231231234', message: 'OTP #{otp} sent successfully to #{phone}' },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find(Button).simulate('click');
    expect(wrapper.find(OutlinedInput).at(0).prop('error')).toBeFalsy();
  });

  it('sets confirmError to be false if there is a valid value', () => {
    const wrapper = shallow(createShallowRegistration());
    wrapper
      .find(OutlinedInput)
      .at(2)
      .simulate('change', { target: { value: 'pass12345' } });
    wrapper
      .find(OutlinedInput)
      .at(3)
      .simulate('change', { target: { value: 'pass12345' } });
    const response = {
      data: { phone: '1231231234', message: 'OTP #{otp} sent successfully to #{phone}' },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find(Button).simulate('click');
    expect(wrapper.find(OutlinedInput).at(3).prop('error')).toBeFalsy();
  });

  it('shows password if button is clicked', () => {
    const wrapper = mount(createRegistration());
    wrapper.find(IconButton).at(0).simulate('click');
    wrapper.find(Visibility);
  });

  it('shows confirm password if button is clicked', () => {
    const wrapper = mount(createRegistration());
    wrapper.find(IconButton).at(1).simulate('click');
    wrapper.find(Visibility);
  });

  it('preventDefault on onMouseDown for password visibility', () => {
    const wrapper = mount(createRegistration());
    wrapper
      .find(IconButton)
      .at(0)
      .simulate('mouseDown', { preventDefault: () => true });
  });

  it('preventDefault on onMouseDown for confirm password visibility', () => {
    const wrapper = mount(createRegistration());
    wrapper
      .find(IconButton)
      .at(1)
      .simulate('mouseDown', { preventDefault: () => true });
  });
});
