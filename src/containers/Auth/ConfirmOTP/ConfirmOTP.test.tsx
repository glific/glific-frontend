import React from 'react';
import { shallow, mount } from 'enzyme';
import { OutlinedInput, Button } from '@material-ui/core';
import axios from 'axios';
import Auth from '../Auth';
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

  it('renders auth', async () => {
    const wrapper = shallow(createConfirmOTP());
    expect(wrapper.find(Auth)).toBeTruthy;
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
