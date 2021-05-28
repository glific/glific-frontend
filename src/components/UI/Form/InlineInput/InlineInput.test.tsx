import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InlineInput } from './InlineInput';

const props = {
  value: '',
  label: 'Input',
  closeModal: jest.fn(),
  callback: jest.fn(),
};

test('it should render component', async () => {
  render(<InlineInput {...props} />);
  const inputElements = screen.getAllByRole('textbox');
  await waitFor(() => {
    fireEvent.change(inputElements[0], { target: { value: 'Glific' } });
  });

  const saveButton = screen.getByTitle('Save');
  fireEvent.click(saveButton);
  expect(props.callback).toHaveBeenCalledTimes(1);

  fireEvent.mouseDown(window.document);
});
