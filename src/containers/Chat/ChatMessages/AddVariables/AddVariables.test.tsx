import { fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AddVariables } from './AddVariables';

const setVariableMock = jest.fn();
const defaultProps = {
  setVariable: setVariableMock,
  handleCancel: jest.fn(),
  bodyText: 'Your OTP for {{1}} is {{2}}. This is valid for {{3}}.',
  updateEditorState: jest.fn(),
  variableParams: jest.fn(),
  variableParam: ['this', '4563', '5 minutes'],
};

test('it should render', () => {
  const { getByTestId } = render(<AddVariables {...defaultProps} />);

  expect(getByTestId('variablesDialog')).toBeInTheDocument();
});

test('save form', async () => {
  const { getByText } = render(<AddVariables {...defaultProps} />);

  fireEvent.click(getByText('Done'));

  await waitFor(() => {
    expect(setVariableMock).toHaveBeenCalled();
  });
});
