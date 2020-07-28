import React from 'react';
import { shallow } from 'enzyme';
import { Automation } from './Automation';

const wrapper = shallow(<Automation match={{ params: { id: 1 } }} />);

describe('<Automation />', () => {
  it('should render Automation', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
