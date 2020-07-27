import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import axios from 'axios';

import { Login } from './Login';
import { Button } from '../../../components/UI/Form/Button/Button';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Login test', () => {
  const createLogin = () => <Login />;
  const createLoginMount = () => (
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  it('renders component properly', () => {
    const wrapper = shallow(createLogin());
    expect(wrapper).toBeTruthy();
  });

  it('updates state for phone number and password', () => {
    const wrapper = shallow(createLogin());
    wrapper
      .find('[data-testid="phoneNumber"]')
      .simulate('change', { target: { value: '1231231234' } });
    wrapper.find('[data-testid="password"]').simulate('change', { target: { value: 'pass12345' } });

    expect(wrapper.find('[data-testid="phoneNumber"]').prop('value')).toEqual('1231231234');
    expect(wrapper.find('[data-testid="password"]').prop('value')).toEqual('pass12345');
  });

  it('send an axios post request properly', () => {
    jest.mock('axios');
    const wrapper = shallow(createLogin());
    wrapper
      .find('[data-testid="phoneNumber"]')
      .simulate('change', { target: { value: '1231231234' } });
    wrapper.find('[data-testid="password"]').simulate('change', { target: { value: 'pass12345' } });
    const response = {
      data: { data: { renewal_token: 'RENEW_TOKEN', access_token: 'AUTH_TOKEN' } },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find(Button).simulate('click');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('shows password if button is clicked', () => {
    const wrapper = mount(createLoginMount());
    wrapper.find(IconButton).simulate('click');
    wrapper.find(Visibility);
  });

  it('preventDefault on onMouseDown for password visibility', () => {
    const wrapper = mount(createLoginMount());
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
    expect(wrapper.find('[data-testid="phoneNumber"]').prop('error')).toBeTruthy;
    expect(wrapper.find('[data-testid="password"]').prop('error')).toBeTruthy;
  });

  it('sets phone number error as false if field is valid', () => {
    jest.mock('axios');
    const wrapper = shallow(createLogin());
    wrapper
      .find('[data-testid="phoneNumber"]')
      .simulate('change', { target: { value: '1231231234' } });
    wrapper.find('[data-testid="password"]').simulate('change', { target: { value: 'pass12345' } });
    const response = {
      data: { data: { renewal_token: 'RENEW_TOKEN', access_token: 'AUTH_TOKEN' } },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find(Button).simulate('click');
    expect(wrapper.find('[data-testid="phoneNumber"]').prop('error')).toBeFalsy();
    expect(wrapper.find('[data-testid="password"]').prop('error')).toBeFalsy();
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
