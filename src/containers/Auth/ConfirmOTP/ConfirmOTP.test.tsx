import React from 'react';
import { shallow, mount } from 'enzyme';
import { OutlinedInput, Button } from '@material-ui/core';
import axios from 'axios';
import { wait } from '@testing-library/react';

import { ConfirmOTP } from './ConfirmOTP';

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

  it('axios post request catchs error', async () => {
    jest.mock('axios');
    const wrapper = mount(createConfirmOTP());
    const response = {
      error: { message: 'Wrong auth code', status: 400 },
    };
    mockedAxios.post.mockRejectedValueOnce(response);
    wrapper.find(Button).simulate('click');
  });

  it('sends post request', async () => {
    jest.mock('axios');
    const wrapper = mount(
      <ConfirmOTP
        location={{
          state: {
            phoneNumber: '1231231234',
            password: 'pass12345',
          },
        }}
      />
    );
    const response = {
      data: { renewal_token: '123213123', access_token: '456456456' },
    };

    wrapper
      .find('[data-testid="AuthenticationCode"] input')
      .simulate('change', { target: { value: '123456' } });
    expect(wrapper.find('[data-testid="AuthenticationCode"] input').prop('value')).toEqual(
      '123456'
    );
    mockedAxios.post = jest.fn().mockResolvedValueOnce(Promise.resolve(response));
    wrapper.find('button[data-testid="AuthButton"]').simulate('click');
    await wait();
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  // TODO: New API is being implemented in the backend that will change this hence commenting it for now
  // it('shows error that says phone number already exists', () => {
  //   jest.mock('axios');
  //   const wrapper = mount(
  //     <ConfirmOTP
  //       location={{
  //         state: {
  //           phoneNumber: '1231231234',
  //           password: 'pass12345',
  //         },
  //       }}
  //     />
  //   );
  //   const response = {
  //     error: { errors: ['does_not_exist'], message: "Couldn't create user", status: 500 },
  //   };

  //   mockedAxios.post.mockRejectedValue(response);
  //   wrapper.find('Button').simulate('click');
  //   expect(wrapper.find(FormHelperText).prop('children')).toEqual(
  //     'An account already exists with this phone number.'
  //   );
  // });
});
