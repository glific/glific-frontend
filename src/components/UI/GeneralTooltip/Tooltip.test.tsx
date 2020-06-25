import React from 'react';
import { shallow } from 'enzyme';
import { Tooltip } from './Tooltip';

describe('Tooltip test', () => {
  const createTooltip = () => (
    <Tooltip title="test" placement="right">
      <h1>children</h1>
    </Tooltip>
  );

  it('renders component properly', () => {
    const wrapper = shallow(createTooltip());
    expect(wrapper).toBeTruthy();
  });
});
