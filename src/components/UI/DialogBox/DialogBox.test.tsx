import React from 'react';
import { mount } from 'enzyme';
import { DialogBox } from './DialogBox';

describe('<DialogBox', () => {
  const mockCallbackCancel = jest.fn();
  const mockCallbackOK = jest.fn();

  it('should not display dialog box if open is false', () => {
    const wrapper = mount(
      <DialogBox
        open={false}
        message={'Are you sure?'}
        handleOK={mockCallbackOK}
        handleCancel={mockCallbackCancel}
      />
    );

    expect(wrapper.find('div.MuiDialog-root').exists()).toBe(false);
  });

  it('should display the same message as passed in the prop', () => {
    const wrapper = mount(
      <DialogBox
        open
        title={'Are you sure?'}
        handleOk={mockCallbackOK}
        handleCancel={mockCallbackCancel}
      />
    );

    expect(wrapper.find('h2.MuiTypography-root').text()).toBe('Are you sure?');
  });

  it('should check if callback method is called when cancel button is clicked', () => {
    const wrapper = mount(
      <DialogBox
        open
        title={'Are you sure?'}
        handleOk={mockCallbackOK}
        handleCancel={mockCallbackCancel}
      />
    );

    wrapper.find('[data-testid="cancel-button"]').simulate('click');
    expect(mockCallbackCancel).toHaveBeenCalled();
  });

  it('should check if callback method is called when cancel button is clicked', () => {
    const wrapper = mount(
      <DialogBox
        open
        title={'Are you sure?'}
        handleOk={mockCallbackOK}
        handleCancel={mockCallbackCancel}
      />
    );

    wrapper.find('button.MuiButton-containedPrimary').simulate('click');
    expect(mockCallbackOK).toHaveBeenCalled();
  });
});
