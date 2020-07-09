import React from 'react';
import { shallow } from 'enzyme';
import { ConfirmOTP } from './ConfirmOTP';
import { OutlinedInput, Button } from '@material-ui/core';

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
});
