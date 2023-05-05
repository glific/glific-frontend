import { fireEvent, render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { MessageDialog } from './MessageDialog';
import { getAttachmentPermissionMock } from 'mocks/Attachment';

const handleClose = vi.fn();

const defaultProps = {
  title: 'Send message',
  onSendMessage: vi.fn(),
  handleClose: handleClose,
};
const wrapper = (
  <MockedProvider mocks={[getAttachmentPermissionMock]}>
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
