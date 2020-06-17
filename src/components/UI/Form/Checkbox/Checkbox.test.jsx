import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme';
import { Checkbox } from './Checkbox';
import { Checkbox as CheckboxElement } from '@material-ui/core';

configure({ adapter: new Adapter() });

describe('<Checbox />', () => {
  it('renders <Checkbox /> component', () => {
    const wrapper = mount(<Checkbox />);
    expect(wrapper).toBeTruthy();
  });

  it('Correct Label', () => {
    const wrapper = mount(<Checkbox label="Is Active" />);
    expect(wrapper.find('label').text()).toEqual('Is Active');
  });

  it('Initial value', () => {
    const wrapper = mount(<Checkbox />);
    expect(wrapper.find('input').getDOMNode().checked).toEqual(false);
  });

  it('Value on Change', () => {
    const wrapper = mount(<Checkbox field={{ checked: true }} />);
    expect(wrapper.find('input').getDOMNode().checked).toEqual(true);
  });
});
