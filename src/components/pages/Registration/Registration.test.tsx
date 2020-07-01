import React from 'react';
import { shallow } from 'enzyme';
import { Registration } from './Registration';

describe('Tooltip test', () => {
  const createRegistration = () => <Registration />;

  it('renders component properly', () => {
    const wrapper = shallow(createRegistration());
    expect(wrapper).toBeTruthy();
  });
});
