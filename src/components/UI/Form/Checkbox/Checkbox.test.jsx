import React from 'react';
import { shallow } from 'enzyme';
import { Checkbox as CheckboxElement } from '@material-ui/core';
import { Checkbox } from './Checkbox';

describe('<Checkbox />', () => {
  it('renders <Checkbox /> component', () => {
    const wrapper = shallow(<Checkbox />);
    expect(wrapper).toBeTruthy();
  });

  it('should have correct label', () => {
    const wrapper = shallow(<Checkbox label="Is Active" />);
    expect(wrapper.find('label').text()).toEqual('Is Active');
  });

  it('should have an initial value', () => {
    const wrapper = shallow(<Checkbox field={{ checked: false }} />);
    expect(wrapper.find(CheckboxElement).props().checked).toEqual(false);
  });

  it('it checked when checked flag is true', () => {
    const wrapper = shallow(<Checkbox field={{ checked: true }} />);
    expect(wrapper.find(CheckboxElement).props().checked).toEqual(true);
  });
});
