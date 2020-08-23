import React from 'react';
import { shallow } from 'enzyme';
import { AutomationList } from './AutomationList';

const wrapper = shallow(<AutomationList />);

describe('<Automation />', () => {
  it('should render Automation', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
