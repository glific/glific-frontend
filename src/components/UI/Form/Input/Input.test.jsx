import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme';

import { Input } from './Input';

configure({ adapter: new Adapter() });

describe('<Input />', () => {
  const wrapper = mount(
    <Input form={{ touched: false, errors: {} }} field={{ name: 'input' }} label="My Input" />
  );
  it('renders <Input /> component', () => {
    expect(wrapper).toBeTruthy();
  });

  it('Correct Label', () => {
    expect(wrapper.find('label').text()).toEqual('My Input');
  });

  it('Initial value', () => {
    expect(wrapper.find('input').getDOMNode().value).toEqual('');
  });
});
