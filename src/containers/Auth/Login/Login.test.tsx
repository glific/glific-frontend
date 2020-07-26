import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import axios from 'axios';
import { wait } from '@testing-library/react';

import { Login } from './Login';

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

  it('send an axios post request properly', async () => {
    jest.mock('axios');
    const wrapper = mount(createLoginMount());
    wrapper
      .find('[data-testid="phoneNumber"] input')
      .simulate('change', { target: { value: '1231231234' } });
    wrapper
      .find('[data-testid="password"] input')
      .simulate('change', { target: { value: 'pass12345' } });
    const response = {
      data: { data: { renewal_token: 'RENEW_TOKEN', access_token: 'AUTH_TOKEN' } },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find('button[data-testid="AuthButton"]').simulate('click');
    await wait();
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

  it('sets phone number error and password error as true if field is blank', async () => {
    const wrapper = mount(createLoginMount());
    wrapper.find('button[data-testid="AuthButton"]').simulate('click');
    await wait();
    expect(wrapper.find('[data-testid="phoneNumber"] input').prop('error')).toBeTruthy();
    expect(wrapper.find('[data-testid="password"] input').prop('error')).toBeTruthy();
  });

  it('sets phone number error as false if field is valid', async () => {
    jest.mock('axios');
    const wrapper = mount(createLoginMount());
    wrapper
      .find('[data-testid="phoneNumber"] input')
      .simulate('change', { target: { value: '1231231234' } });
    wrapper
      .find('[data-testid="password"] input')
      .simulate('change', { target: { value: 'pass12345' } });
    const response = {
      data: { data: { renewal_token: 'RENEW_TOKEN', access_token: 'AUTH_TOKEN' } },
    };
    mockedAxios.post.mockResolvedValueOnce(response);
    wrapper.find('button[data-testid="AuthButton"]').simulate('click');
    await wait();
    expect(wrapper.find('[data-testid="phoneNumber"] input').prop('error')).toBeFalsy();
    expect(wrapper.find('[data-testid="password"] input').prop('error')).toBeFalsy();
  });

  it('axios post request catchs error', async () => {
    jest.mock('axios');
    const wrapper = mount(createLoginMount());
    const response = {
      error: { message: 'Incorrect password or phone', status: 400 },
    };
    mockedAxios.post.mockRejectedValueOnce(response);
    wrapper.find('button[data-testid="AuthButton"]').simulate('click');
  });
});
