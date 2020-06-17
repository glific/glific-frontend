import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import { Checkbox } from './Checkbox';
import { Checkbox as CheckboxElement } from '@material-ui/core';

configure({ adapter: new Adapter() });

describe('<Checbox />', () => {
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
