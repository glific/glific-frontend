import React from 'react';
import { mount } from 'enzyme';
import { DialogBox } from './DialogBox';

const mockCallbackCancel = jest.fn();
const mockCallbackOK = jest.fn();
const dialogBox = (
  <DialogBox
    open
    title={'Are you sure?'}
    handleOk={mockCallbackOK}
    handleCancel={mockCallbackCancel}
  />
);

it('should not display dialog box if open is false', () => {
  const wrapper = mount(
    <DialogBox
      open={false}
      title={'Are you sure?'}
      handleOk={mockCallbackOK}
      handleCancel={mockCallbackCancel}
    />
  );

  expect(wrapper.find('div.MuiDialog-root').exists()).toBe(false);
});

it('should display the same message as passed in the prop', () => {
  const wrapper = mount(dialogBox);
  expect(wrapper.find('h2.MuiTypography-root').text()).toBe('Are you sure?');
});

it('should check if callback method is called when cancel button is clicked', () => {
  const wrapper = mount(dialogBox);
  wrapper.find('button[data-testid="cancel-button"]').simulate('click');
  expect(mockCallbackCancel).toHaveBeenCalled();
});

it('should check if callback method is called when confirm button is clicked', () => {
  const wrapper = mount(dialogBox);
  wrapper.find('button.MuiButton-containedPrimary').simulate('click');
  expect(mockCallbackOK).toHaveBeenCalled();
});
