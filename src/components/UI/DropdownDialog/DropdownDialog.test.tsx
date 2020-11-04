import React from 'react';
import { mount } from 'enzyme';
import { DropdownDialog } from './DropdownDialog';
import { DialogBox } from '../DialogBox/DialogBox';
import { Dropdown } from '../Form/Dropdown/Dropdown';
import { Select } from '@material-ui/core';
import { act } from 'react-dom/test-utils';

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

test('handleOk and onChange function', () => {
  const wrapper = mount(dialogBox);
  wrapper.find(DialogBox).prop('handleOk')();
  expect(mockCallbackOK).toBeCalled();

  act(() => {
    wrapper
      .find(Select)
      .at(0)
      .props()
      .onChange({ target: { value: 1 } });
  });
});
