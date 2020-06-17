import React from 'react';
import { shallow } from 'enzyme';
import { TextField } from '@material-ui/core';
import { Input } from './Input';

describe('<Input />', () => {
  const wrapper = shallow(
    <Input
      form={{ touched: false, errors: {} }}
      field={{ name: 'input', value: '' }}
      label="My Input"
    />
  );
  it('renders <Input /> component', () => {
    expect(wrapper).toBeTruthy();
  });

  it('should have correct label', () => {
    expect(wrapper.find('label').text()).toEqual('My Input');
  });

  it('should have an initial value', () => {
    expect(wrapper.find(TextField).props().value).toEqual('');
  });
});
