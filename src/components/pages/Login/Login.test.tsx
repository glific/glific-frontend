import React from 'react';
import { shallow } from 'enzyme';
import { Login } from './Login';

describe('Login test', () => {
  const createLogin = () => <Login />;

  it('renders component properly', () => {
    const wrapper = shallow(createLogin());
    expect(wrapper).toBeTruthy();
  });
});
