import React from 'react';
import Content from './Content';
import { shallow } from 'enzyme';

describe('content component tests', () => {
  it('initialized', () => {
    const wrapper = shallow(<Content />);
    expect(wrapper).toBeTruthy();
  });

  it('correct content', () => {
    let text = 'Testing text';
    const wrapper = shallow(<Content>{text}</Content>);
    expect(wrapper.find('div').at(1).text()).toEqual(text); // Get children div
  });
});
