import React from 'react';
import { shallow, mount } from 'enzyme';
import ToastMessage from './ToastMessage';
import Alert from '@material-ui/lab/Alert';

describe('<ToastMessage />', () => {
  const mockCallback = jest.fn();

  it('should not display toast message if open is false', () => {
    const wrapper = mount(
      <ToastMessage
        open={false}
        severity={'success'}
        message={'Saved.'}
        handleClose={mockCallback}
      />
    );

    expect(wrapper.find('button.MuiButtonBase-root')).toHaveLength(0);
  });

  it('should display the message text as passed in the prop', () => {
    const wrapper = shallow(
      <ToastMessage open severity={'success'} message={'Saved.'} handleClose={mockCallback} />
    );
    expect(wrapper.find(Alert).text()).toBe('Saved.');
  });

  it('should check if the callback method is called when close button clicked', () => {
    const wrapper = mount(
      <ToastMessage open severity={'success'} message={'Saved.'} handleClose={mockCallback} />
    );

    wrapper.find('button.MuiButtonBase-root').simulate('click');
    expect(mockCallback).toHaveBeenCalled();
  });
});
