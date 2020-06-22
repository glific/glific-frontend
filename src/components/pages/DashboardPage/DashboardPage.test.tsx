import React from 'react';
import { shallow } from 'enzyme';
import { DashboardPage } from './DashboardPage';

const wrapper = shallow(<DashboardPage />);

describe('<Dashboard/>', () => {
  it('should provide a welcome message', () => {
    expect(wrapper.find('div').text()).toBe('Welcome to Glific!');
  });
});
