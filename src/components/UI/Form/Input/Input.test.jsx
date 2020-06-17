import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';

import { Input } from './Input';
import { TextField } from '@material-ui/core';

configure({ adapter: new Adapter() });

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

  it('Correct Label', () => {
    expect(wrapper.find('label').text()).toEqual('My Input');
  });

  it('Initial value', () => {
    expect(wrapper.find(TextField).props().value).toEqual('');
  });
});
