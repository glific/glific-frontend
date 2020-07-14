import React from 'react';
import { shallow, mount } from 'enzyme';
import { ConfirmOTP } from './ConfirmOTP';
import { OutlinedInput, Button, FormHelperText } from '@material-ui/core';
import axios from 'axios';
import { Redirect } from 'react-router';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ConfirmOTP test', () => {
  const createConfirmOTP = () => <ConfirmOTP location={undefined} />;

  it('renders component properly', () => {
    const wrapper = shallow(createConfirmOTP());
    expect(wrapper).toBeTruthy();
  });

  it('updates state for auth code', () => {
    const wrapper = shallow(createConfirmOTP());
    wrapper.find(OutlinedInput).simulate('change', { target: { value: '123456' } });
    expect(wrapper.find(OutlinedInput).prop('value')).toEqual('123456');
  });

  it('axios post request catchs error', () => {
    jest.mock('axios');
    const wrapper = mount(createConfirmOTP());
    const response = {
      error: { message: 'Wrong auth code', status: 400 },
    };
    mockedAxios.post.mockRejectedValueOnce(response);
    wrapper.find(Button).simulate('click');
  });

  it('sends post request', () => {
    jest.mock('axios');
    const wrapper = shallow(
      <ConfirmOTP
        location={{
          state: {
            phoneNumber: '1231231234',
            password: 'pass12345',
            password_confirmation: 'pass12345',
          },
        }}
      />
    );
    const response = {
      data: { renewal_token: '123213123', access_token: '456456456' },
    };
    wrapper
      .find(OutlinedInput)
      .at(0)
      .simulate('change', { target: { value: '123456' } });
    expect(wrapper.find(OutlinedInput).prop('value')).toEqual('123456');
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find('Button').simulate('click');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('shows error if code too short', () => {
    jest.mock('axios');
    const wrapper = mount(
      <ConfirmOTP
        location={{
          state: {
            phoneNumber: '1231231234',
            password: 'pass12345',
            password_confirmation: 'pass12345',
          },
        }}
      />
    );
    wrapper
      .find(OutlinedInput)
      .at(0)
      .simulate('change', { target: { value: '12345' } });
    wrapper.find('Button').simulate('click');
    expect(wrapper.find(FormHelperText).prop('children')).toEqual('Invalid authentication code.');
  });

  it('shows error that says phone number already exists', () => {
    jest.mock('axios');
    const wrapper = mount(
      <ConfirmOTP
        location={{
          state: {
            phoneNumber: '1231231234',
            password: 'pass12345',
            password_confirmation: 'pass12345',
          },
        }}
      />
    );
    const response = {
      data: { renewal_token: '123213123', access_token: '456456456' },
    };
    wrapper
      .find(OutlinedInput)
      .at(0)
      .simulate('change', { target: { value: '12345' } });
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find('Button').simulate('click');
    expect(wrapper.find(Redirect)).toBeTruthy();
  });
});
