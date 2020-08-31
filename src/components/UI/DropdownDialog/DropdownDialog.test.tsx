import React from 'react';
import { mount } from 'enzyme';
import { DropdownDialog } from './DropdownDialog';

const mockCallbackCancel = jest.fn();
const mockCallbackOK = jest.fn();
const dialogBox = (
  <DropdownDialog
    title="Default dialog"
    handleOk={mockCallbackOK}
    handleCancel={mockCallbackCancel}
    options={[{ id: '1', label: 'default' }]}
    description="This is default dialog"
  ></DropdownDialog>
);

test('it should contain a dropdown', () => {
  const wrapper = mount(dialogBox);
  expect(wrapper.find('[data-testid="dropdown"]').exists()).toBe(true);
});

test('it should have a description as per default value', () => {
  const wrapper = mount(dialogBox);
  expect(wrapper.find('[data-testid="description"]').text()).toBe('This is default dialog');
});
