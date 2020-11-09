import React from 'react';
import { shallow, mount } from 'enzyme';
import { Tooltip } from './Tooltip';
import * as TooltipElement from '@material-ui/core/Tooltip';

describe('Tooltip test', () => {
  const createTooltip = (props: any) => (
    <Tooltip title="test" placement="right" {...props}>
      children
    </Tooltip>
  );

  it('renders component properly', () => {
    const wrapper = shallow(createTooltip({}));
    expect(wrapper).toBeTruthy();
  });

  it('renders Tooltip', () => {
    const wrapper = shallow(createTooltip({}));
    expect(wrapper.find(Tooltip)).toBeTruthy();
  });

  it('displays correct title', () => {
    const wrapper = shallow(createTooltip({}));
    expect(wrapper.prop('title')).toEqual('test');
  });

  it('has the correct placement', () => {
    const wrapper = shallow(createTooltip({}));
    expect(wrapper.prop('placement')).toEqual('right');
  });

  it('component shows arrow', () => {
    const wrapper = shallow(createTooltip({}));
    expect(wrapper.prop('arrow')).toEqual(true);
  });

  it('receives children as prop', () => {
    const wrapper = shallow(createTooltip({}));
    expect(wrapper.prop('children')).toBeTruthy;
  });

  it('should add the classes send as props', () => {
    const wrapper = mount(
      createTooltip({ tooltipArrowClass: 'tooltipArrow', tooltipClass: 'tooltip' })
    );
    expect(wrapper.find(TooltipElement.default).prop('classes')?.arrow).toContain('tooltipArrow');
    expect(wrapper.find(TooltipElement.default).prop('classes')?.tooltip).toContain('tooltip')
  });
});
