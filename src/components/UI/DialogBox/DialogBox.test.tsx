import { fireEvent, render, screen } from '@testing-library/react';
import { DialogBox } from './DialogBox';

const mockCallbackCancel = vi.fn();
const mockCallbackOK = vi.fn();
const dialogBox = (
  <DialogBox
    open
    title={'Are you sure?'}
    handleOk={mockCallbackOK}
    handleCancel={mockCallbackCancel}
    titleAlign="left"
    alignButtons="center"
    contentText="This is context text"
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

it('Dialogbox with no ok and cancel buttons', () => {
  const { container } = render(
    <DialogBox
      skipOk
      skipCancel
      title="Dialog with no action buttons"
      handleCancel={mockCallbackCancel}
    />
  );
  expect(container).toBeInTheDocument();
});

it('should have a middle button when buttonMiddle prop is passed', async () => {
  const handleMiddleButtonMock = vi.fn();
  render(
    <DialogBox
      skipOk
      skipCancel
      title="Dialog with middle button"
      buttonMiddle="Configure"
      handleMiddle={handleMiddleButtonMock}
    />
  );
  const middleButton = await screen.getByTestId('middle-button');
  fireEvent.click(middleButton);
  expect(handleMiddleButtonMock).toBeCalled();
});

it('onClose event should be triggered if escape key is pressed', async () => {
  const handleCancelMock = vi.fn();
  render(<DialogBox title="Dialog with onClose action" handleCancel={handleCancelMock} />);
  fireEvent.keyDown(screen.getByText(/Dialog with onClose action/i), {
    key: 'Escape',
    code: 'Escape',
    keyCode: 27,
    charCode: 27,
  });
  expect(handleCancelMock).toBeCalled();
});
