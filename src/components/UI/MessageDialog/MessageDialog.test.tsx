import React from 'react';

import { mount } from 'enzyme';
import { MessageDialog } from './MessageDialog';
import { MockedProvider } from '@apollo/client/testing';

const handleClose = jest.fn();

const defaultProps = {
  title: 'Send message',
  onSendMessage: jest.fn(),
  handleClose: handleClose,
};
const wrapper = mount(
  <MockedProvider>
    <MessageDialog {...defaultProps} />
  </MockedProvider>
);

test('it should have correct title', () => {
  expect(wrapper.find('div[data-testid="title"]').text()).toEqual('Send message');
});

test('it should close the dialog box on clicking close button', () => {
  wrapper.find('svg[data-testid="closeButton"]').simulate('click');
  expect(handleClose).toBeCalled();
});
