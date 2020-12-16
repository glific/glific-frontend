import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AddVariables } from './AddVariables';

const defaultProps = {
  setVariable: jest.fn(),
  handleCancel: jest.fn(),
  bodyText: 'Your OTP for {{1}} is {{2}}. This is valid for {{3}}.',
};

test('it should render', () => {
  const { getByTestId } = render(<AddVariables {...defaultProps} />);

  expect(getByTestId('variablesDialog')).toBeInTheDocument();
});
