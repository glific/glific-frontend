import React from 'react';
import { mount } from 'enzyme';
import { Checkbox as CheckboxElement } from '@material-ui/core';
import { Checkbox } from './Checkbox';

const defaultProps = {
  title: 'Default Checkbox',
  field: {
    name: 'checkbox',
    value: false,
  },
  form: null,
};

const wrapper = mount(<Checkbox {...defaultProps} />);
it('renders <Checkbox /> component', () => {
  expect(wrapper).toBeTruthy();
});

it('should have correct label', () => {
  expect(
    wrapper.find('label[data-testid="checkboxLabel"] > .MuiFormControlLabel-label').text()
  ).toEqual('Default Checkbox');
});
