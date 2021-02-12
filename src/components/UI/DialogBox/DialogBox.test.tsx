import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { DialogBox } from './DialogBox';

const mockCallbackCancel = jest.fn();
const mockCallbackOK = jest.fn();
const dialogBox = (
  <DialogBox
    open
    title={'Are you sure?'}
    handleOk={mockCallbackOK}
    handleCancel={mockCallbackCancel}
  />
);

it('should not display dialog box if open is false', () => {
  const { queryByTestId } = render(
    <DialogBox
      open={false}
      title={'Are you sure?'}
      handleOk={mockCallbackOK}
      handleCancel={mockCallbackCancel}
    />
  );

  expect(queryByTestId('dialogBox')).toBe(null);
});

it('should display the same message as passed in the prop', () => {
  const { getByTestId } = render(dialogBox);
  expect(getByTestId('dialogTitle')).toHaveTextContent('Are you sure?');
});

it('should check if callback method is called when cancel button is clicked', () => {
  const { getByTestId } = render(dialogBox);
  fireEvent.click(getByTestId('cancel-button'));
  expect(mockCallbackCancel).toHaveBeenCalled();
});

it('should check if callback method is called when confirm button is clicked', () => {
  const { getByTestId } = render(dialogBox);
  fireEvent.click(getByTestId('ok-button'));
  expect(mockCallbackOK).toHaveBeenCalled();
});
