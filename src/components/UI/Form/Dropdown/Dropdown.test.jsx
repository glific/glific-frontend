import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme';
import { Dropdown } from './Dropdown';

configure({ adapter: new Adapter() });

describe('<Dropdown />', () => {
  it('renders <Dropdown /> component', () => {
    const wrapper = mount(<Dropdown />);
    expect(wrapper).toBeTruthy();
  });

  it('Correct Label', () => {
    const wrapper = mount(<Dropdown label="Dropdown" />);
    expect(wrapper.find('label').text()).toEqual('Dropdown');
  });

  it('Initial value', () => {
    const wrapper = mount(<Dropdown field={{ value: 1 }} />);
    expect(wrapper.find('input').getDOMNode().value).toEqual('1');
  });
});
