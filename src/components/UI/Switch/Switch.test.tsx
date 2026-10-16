import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

test('reflects the checked state it is given', () => {
  render(<Switch checked onChange={vi.fn()} testId="mySwitch" />);

  expect(screen.getByTestId('mySwitch')).toBeChecked();
});

test('reports the new state when flipped', () => {
  const onChange = vi.fn();
  render(<Switch checked={false} onChange={onChange} testId="mySwitch" />);

  fireEvent.click(screen.getByTestId('mySwitch'));

  expect(onChange).toHaveBeenCalledWith(true);
});

test('cannot be flipped while disabled', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<Switch checked={false} onChange={onChange} disabled testId="mySwitch" />);

  const input = screen.getByTestId('mySwitch');
  expect(input).toBeDisabled();

  await expect(user.click(input)).rejects.toThrow('pointer-events: none');
  expect(onChange).not.toHaveBeenCalled();
});
