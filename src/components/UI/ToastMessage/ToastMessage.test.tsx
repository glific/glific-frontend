import React from 'react';
import { shallow } from 'enzyme';
import ToastMessage from './ToastMessage';
import Alert from '@material-ui/lab/Alert';
import { Snackbar } from '@material-ui/core';

describe('<ToastMessage />', () => {
  let wrapper: any;
  let open = true;

  const handleClose = () => {
    return (open = false);
  };

  beforeEach(() => {
    wrapper = shallow(<ToastMessage />);
  });

  it('should not display any text if open is false', () => {
    // const wrapper = shallow(<ToastMessage />);
    expect(wrapper.find(Alert).text()).toBe('');
  });

  it('should provide same message passing in prop', () => {
    wrapper.setProps({
      open: open,
      message: 'Hello',
      severity: 'success',
      seconds: 4000,
      handleClose: handleClose,
    });

    expect(wrapper.find(Alert).text()).toBe('Hello');
  });

  it('should close toastmessage if close button is selected', () => {
    wrapper.setProps({
      open: open,
      message: 'Hello',
      severity: 'success',
      seconds: 4000,
      handleCloseButton: wrapper.setProps({ open: false }),
    });

    // Used to Invoke the function

    wrapper
      .find(Alert)
      .invoke('onClose')()
      .then(() => {
        expect(wrapper.find(Alert).text()).toBe('');
      });

    console.log(wrapper.find(Alert).props());
  });
});
