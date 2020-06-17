import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import { Dropdown } from './Dropdown';
import { Select } from '@material-ui/core';

configure({ adapter: new Adapter() });

describe('<Dropdown />', () => {
  it('renders <Dropdown /> component', () => {
    const wrapper = shallow(<Dropdown />);
    expect(wrapper).toBeTruthy();
  });

  it('should have correct label', () => {
    const wrapper = shallow(<Dropdown label="Dropdown" />);
    expect(wrapper.find('label').text()).toEqual('Dropdown');
  });

  it('should have an initial value', () => {
    const wrapper = shallow(<Dropdown field={{ value: 1 }} />);
    expect(wrapper.find(Select).props().value).toEqual(1);
  });
});
