import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Visibility from '@material-ui/icons/Visibility';
import { IconButton } from '@material-ui/core';

import { Registration } from './Registration';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const createRegistration = () => <Registration />;
const createRegistrationMount = () => (
  <MemoryRouter>
    <Registration />
  </MemoryRouter>
);

it('renders component properly', () => {
  const wrapper = shallow(createRegistration());
  expect(wrapper).toBeTruthy();
});

it('updates state for username', () => {
  const wrapper = shallow(createRegistration());
  wrapper.find('[data-testid="username"]').simulate('change', { target: { value: 'JaneDoe' } });
  expect(wrapper.find('[data-testid="username"]').prop('value')).toEqual('JaneDoe');
});

it('adds state to phoneNumber', () => {
  const wrapper = shallow(createRegistration());
  wrapper
    .find('[data-testid="phoneNumber"]')
    .simulate('change', { target: { value: '1231231234' } });
  expect(wrapper.find('[data-testid="phoneNumber"]').prop('value')).toEqual('1231231234');
});

it('adds state to password', () => {
  const wrapper = shallow(createRegistration());
  wrapper
    .find('[data-testid="password"]')
    .simulate('change', { target: { value: 'randompassword' } });
  expect(wrapper.find('[data-testid="password"]').prop('value')).toEqual('randompassword');
});

it('send an axios post request properly', () => {
  jest.mock('axios');
  const wrapper = shallow(createRegistration());
  wrapper.find('[data-testid="username"]').simulate('change', { target: { value: 'JaneDoe' } });
  wrapper
    .find('[data-testid="phoneNumber"]')
    .simulate('change', { target: { value: '1231231234' } });
  wrapper
    .find('[data-testid="password"]')
    .simulate('change', { target: { value: 'randompassword' } });
  const response = {
    data: { phone: '1231231234', message: 'OTP #{otp} sent successfully to #{phone}' },
  };
  mockedAxios.post.mockResolvedValueOnce(response);
  wrapper.find('[data-testid="registrationButton"]').simulate('click');
  expect(mockedAxios.post).toHaveBeenCalledTimes(1);
});

it('axios post request catchs error', () => {
  jest.mock('axios');
  const wrapper = shallow(createRegistration());
  const response = {
    error: { message: 'Phone number not found', status: 400 },
  };
  mockedAxios.post.mockRejectedValueOnce(response);
  wrapper.find('[data-testid="registrationButton"]').simulate('click');
});

it('set errors if the form fields are blank', () => {
  const wrapper = shallow(createRegistration());
  wrapper.find('[data-testid="registrationButton"]').simulate('click');
  expect(wrapper.find('[data-testid="username"]').prop('error')).toBeTruthy();
  expect(wrapper.find('[data-testid="phoneNumber"]').prop('error')).toBeTruthy();
  expect(wrapper.find('[data-testid="password"]').prop('error')).toBeTruthy();
});

it('no errors are set when if there are valid values', () => {
  const wrapper = shallow(createRegistration());
  wrapper.find('[data-testid="username"]').simulate('change', { target: { value: 'JaneDoe' } });
  wrapper
    .find('[data-testid="phoneNumber"]')
    .simulate('change', { target: { value: '1231231234' } });
  wrapper
    .find('[data-testid="password"]')
    .simulate('change', { target: { value: 'randompassword' } });

  const response = { data: {} };
  mockedAxios.post.mockResolvedValueOnce(response);
  wrapper.find('[data-testid="registrationButton"]').simulate('click');
  expect(wrapper.find('[data-testid="username"]').prop('error')).toBeFalsy();
});

it('shows password if button is clicked', () => {
  const wrapper = mount(createRegistrationMount());
  wrapper.find(IconButton).at(0).simulate('click');
  wrapper.find(Visibility);
});

it('preventDefault on onMouseDown for password visibility', () => {
  const wrapper = mount(createRegistrationMount());
  wrapper
    .find(IconButton)
    .at(0)
    .simulate('mouseDown', { preventDefault: () => true });
});
