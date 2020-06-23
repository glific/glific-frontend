import React from 'react';
import { Header } from './Header';
import { shallow } from 'enzyme';
import { IconButton } from '@material-ui/core';

describe('header tests', () => {
  let isToggled = false;
  const handleToggle = () => {
    isToggled = !isToggled;
  };
  const headerObj = <Header MenuToggle={handleToggle} />;

  it('component renders a component', () => {
    const wrapper = shallow(headerObj);
    expect(wrapper).toBeTruthy();
  });

  it('changes state appropriately', () => {
    const wrapper = shallow(headerObj);
    wrapper.find(IconButton).simulate('click'); // Fixed to IconButton, but can't seem to find a prop passed into the parent component.
    expect(isToggled).toBe(true);
    wrapper.find(IconButton).simulate('click');
    expect(isToggled).toBe(false);
  });
});
