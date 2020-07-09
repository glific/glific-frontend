import React from 'react';
import { shallow } from 'enzyme';
import { ConfirmOTP } from './ConfirmOTP';

describe('Authentication test', () => {
  const createAuthentication = () => <ConfirmOTP location={undefined} />;

  it('renders component properly', () => {
    const wrapper = shallow(createAuthentication());
    expect(wrapper).toBeTruthy();
  });
});
