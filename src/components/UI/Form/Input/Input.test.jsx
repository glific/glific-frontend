import React from 'react';
import { shallow } from 'enzyme';
import { OutlinedInput, InputLabel } from '@material-ui/core';
import { Input } from './Input';

describe('<Input />', () => {
  const wrapper = shallow(
    <Input
      form={{ touched: false, errors: {} }}
      field={{ name: 'input', value: '' }}
      placeholder="Title"
    />
  );
  it('renders <Input /> component', () => {
    expect(wrapper).toBeTruthy();
  });

  it('should have correct label', () => {
    expect(wrapper.find(InputLabel).text()).toEqual('Title');
  });

  it('should have an initial value', () => {
    expect(wrapper.find(OutlinedInput).props().value).toEqual('');
  });
});
