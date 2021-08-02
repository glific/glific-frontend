import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { InlineInput } from './InlineInput';

const props: any = {
  value: '',
  closeModal: jest.fn(),
  callback: jest.fn(),
  error: null,
};

test('it should render component', async () => {
  render(<InlineInput {...props} />);
  const inputElements = screen.getAllByRole('textbox');
  fireEvent.change(inputElements[0], { target: { value: 'Glific' } });
  await waitFor(() => {});

  const saveButton = screen.getByTitle('Save');
  fireEvent.click(saveButton);
  expect(props.callback).toHaveBeenCalledTimes(1);

  fireEvent.mouseDown(window.document);
});

test('it should render component with error', async () => {
  props.error = 'Shortcode value is already taken';
  render(<InlineInput {...props} />);
  const inputElements = screen.getAllByRole('textbox');
  fireEvent.change(inputElements[0], { target: { value: '' } });
  await waitFor(() => {});

  const saveButton = screen.getByTitle('Save');
  fireEvent.click(saveButton);
});
