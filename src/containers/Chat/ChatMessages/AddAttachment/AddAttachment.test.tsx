import { render } from '@testing-library/react';
import React from 'react';

import { AddAttachment } from './AddAttachment';

const defaultProps = {
  setAttachment: true,
  setAttachmentURL: jest.fn(),
  setAttachmentAdded: false,
  setAttachmentType: jest.fn(),
  attachmentURL: '',
  attachmentType: '',
};

test('it should render', () => {
  const { getByTestId } = render(<AddAttachment {...defaultProps} />);

  expect(getByTestId('dialogBox')).toBeInTheDocument();
});
