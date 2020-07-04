import React from 'react';
import { shallow } from 'enzyme';
import { Authentication } from './Authentication';

describe('Tooltip test', () => {
  const createAuthentication = () => <Authentication location={null} />;

  it('renders component properly', () => {
    const wrapper = shallow(createAuthentication());
    expect(wrapper).toBeTruthy();
  });
});
