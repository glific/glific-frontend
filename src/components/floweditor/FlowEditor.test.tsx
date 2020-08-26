import React from 'react';
import { mount } from 'enzyme';
import { FlowEditor } from './FlowEditor';

const wrapper = mount(<FlowEditor uuid="d3223dvfdfddffdknf" />);

test('it should display the flowEditor', () => {
  expect(wrapper.find('#flow').exists()).toBe(true);
});
