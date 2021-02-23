import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { MessageDialog } from './MessageDialog';
import { MockedProvider } from '@apollo/client/testing';

const handleClose = jest.fn();

const defaultProps = {
  title: 'Send message',
  onSendMessage: jest.fn(),
  handleClose: handleClose,
};
const wrapper = (
  <MockedProvider>
    <MessageDialog {...defaultProps} />
  </MockedProvider>
);

test('it should have correct title', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('title')).toHaveTextContent('Send message');
});

test('it should close the dialog box on clicking close button', () => {
  const { getByTestId } = render(wrapper);
  fireEvent.click(getByTestId('closeButton'));
  expect(handleClose).toBeCalled();
});
