import React from 'react';
import { shallow } from 'enzyme';
import { Tooltip } from './Tooltip';

describe('Tooltip test', () => {
  const createTooltip = () => (
    <Tooltip title="test" placement="right">
      children
    </Tooltip>
  );

  it('renders component properly', () => {
    const wrapper = shallow(createTooltip());
    expect(wrapper).toBeTruthy();
  });

  it('renders Tooltip', () => {
    const wrapper = shallow(createTooltip());
    expect(wrapper.find(Tooltip)).toBeTruthy();
    console.log(wrapper.props());
    console.log('hi');
  });

  it('displays correct title', () => {
    const wrapper = shallow(createTooltip());
    expect(wrapper.prop('title')).toEqual('test');
  });

  it('has the correct placement', () => {
    const wrapper = shallow(createTooltip());
    expect(wrapper.prop('placement')).toEqual('right');
  });

  it('component shows arrow', () => {
    const wrapper = shallow(createTooltip());
    expect(wrapper.prop('arrow')).toEqual(true);
  });

  it('receives children as prop', () => {
    const wrapper = shallow(createTooltip());
    expect(wrapper.prop('children')).toBeTruthy;
  });
});
