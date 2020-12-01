import { render } from '@testing-library/react';
import React from 'react';

import { MessageType } from './MessageType';

const defaultProps = {
  type: 'IMAGE',
};
test('it should render', () => {
  const { getByTestId } = render(<MessageType {...defaultProps} />);

  expect(getByTestId('messageType')).toBeInTheDocument();
});
